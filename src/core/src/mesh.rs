use futures::StreamExt;
use libp2p::{
    gossipsub, kad, mdns, noise, swarm::{NetworkBehaviour, SwarmEvent}, tcp, yamux, SwarmBuilder,
};
use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::mpsc;

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct ChatMessage {
    pub msg_type: String, // Always "chat"
    pub id: String,
    pub sender_id: String,
    pub receiver_id: String,
    pub text: String,
    pub timestamp: u64,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct PeerProfile {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub bio: String,
    #[serde(default)]
    pub tags: String,
    #[serde(default)]
    pub images: String,
    #[serde(default)]
    pub gender: String,
    #[serde(default)]
    pub interested_in: String,
}

#[derive(Clone, Serialize)]
struct ResonanceEvent {
    profile_id: String,
    score: f32,
    timestamp: u64,
    peer_data: Option<PeerProfile>,
}

#[derive(NetworkBehaviour)]
struct AuraBehaviour {
    gossipsub: gossipsub::Behaviour,
    mdns: mdns::tokio::Behaviour,
    kad: kad::Behaviour<kad::store::MemoryStore>,
}

static TOPIC_NAME: &str = "aura-resonance-v1";
static mut BROADCAST_TX: Option<mpsc::UnboundedSender<Vec<u8>>> = None;

pub fn start_mesh(app: AppHandle) {
    let (tx, mut rx) = mpsc::unbounded_channel::<Vec<u8>>();
    unsafe {
        BROADCAST_TX = Some(tx);
    }

    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            let mut swarm = SwarmBuilder::with_new_identity()
                .with_tokio()
                .with_tcp(
                    tcp::Config::default(),
                    noise::Config::new,
                    yamux::Config::default,
                )
                .expect("Failed to build TCP transport")
                .with_behaviour(|key| {
                    // Gossipsub setup
                    let message_id_fn = |message: &gossipsub::Message| {
                        let mut s = DefaultHasher::new();
                        message.data.hash(&mut s);
                        gossipsub::MessageId::from(s.finish().to_string())
                    };
                    let gossipsub_config = gossipsub::ConfigBuilder::default()
                        .heartbeat_interval(Duration::from_secs(10))
                        .validation_mode(gossipsub::ValidationMode::Permissive)
                        .message_id_fn(message_id_fn)
                        .max_transmit_size(10 * 1024 * 1024) // 10MB limit for images
                        .build()
                        .map_err(|msg| std::io::Error::new(std::io::ErrorKind::Other, msg))?;

                    let gossipsub = gossipsub::Behaviour::new(
                        gossipsub::MessageAuthenticity::Signed(key.clone()),
                        gossipsub_config,
                    ).map_err(|msg| std::io::Error::new(std::io::ErrorKind::Other, msg))?;

                    // mDNS (Local Discovery)
                    let mdns = mdns::tokio::Behaviour::new(mdns::Config::default(), key.public().to_peer_id())?;

                    // Kademlia (Global Discovery)
                    let store = kad::store::MemoryStore::new(key.public().to_peer_id());
                    let kad = kad::Behaviour::new(key.public().to_peer_id(), store);

                    Ok(AuraBehaviour { gossipsub, mdns, kad })
                })
                .expect("Failed to create behaviour")
                .with_swarm_config(|c| c.with_idle_connection_timeout(Duration::from_secs(60)))
                .build();

            // Subscribe to the global topic
            let topic = gossipsub::IdentTopic::new(TOPIC_NAME);
            swarm.behaviour_mut().gossipsub.subscribe(&topic).ok();

            // Listen on all interfaces
            swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse().unwrap()).ok();

            println!("[P2P] Swarm started. PeerId: {}", swarm.local_peer_id());

            loop {
                tokio::select! {
                    encoded = rx.recv() => {
                        if let Some(bytes) = encoded {
                            swarm.behaviour_mut().gossipsub.publish(topic.clone(), bytes).ok();
                        }
                    }
                    event = swarm.select_next_some() => match event {
                        SwarmEvent::ConnectionEstablished { peer_id, endpoint, .. } => {
                            println!("[P2P] Connection established with {} at {:?}", peer_id, endpoint);
                        }
                        SwarmEvent::ConnectionClosed { peer_id, cause, .. } => {
                            println!("[P2P] Connection closed with {}: {:?}", peer_id, cause);
                        }
                        SwarmEvent::OutgoingConnectionError { peer_id, error, .. } => {
                            println!("[P2P] Failed to dial {:?}: {:?}", peer_id, error);
                        }
                        SwarmEvent::Behaviour(AuraBehaviourEvent::Gossipsub(gossipsub::Event::Subscribed { peer_id, topic })) => {
                            println!("[P2P] Peer {} subscribed to topic: {}", peer_id, topic);
                        }
                        SwarmEvent::Behaviour(AuraBehaviourEvent::Mdns(mdns::Event::Discovered(list))) => {
                            for (peer_id, multiaddr) in list {
                                println!("[P2P] mDNS discovered peer: {} at {}", peer_id, multiaddr);
                                swarm.behaviour_mut().gossipsub.add_explicit_peer(&peer_id);
                                swarm.behaviour_mut().kad.add_address(&peer_id, multiaddr.clone());
                                swarm.dial(multiaddr).ok(); 
                            }
                        }
                        SwarmEvent::Behaviour(AuraBehaviourEvent::Gossipsub(gossipsub::Event::Message {
                            propagation_source: peer_id,
                            message_id: _id,
                            message,
                        })) => {
                            if let Ok(peer) = serde_json::from_slice::<PeerProfile>(&message.data) {
                                if !peer.id.is_empty() && peer.name.len() > 0 {
                                    println!("[P2P] Received Aura via Gossipsub from {}", peer_id);
                                    let res_event = ResonanceEvent {
                                        profile_id: peer.id.clone(),
                                        score: 1.0,
                                        timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
                                        peer_data: Some(peer),
                                    };
                                    app.emit("resonance_detected", res_event).ok();
                                }
                            }
                            if let Ok(chat) = serde_json::from_slice::<ChatMessage>(&message.data) {
                                if chat.msg_type == "chat" {
                                    println!("[P2P] Received Chat Message from {}", chat.sender_id);
                                    
                                    // Persist incoming message directly to local SQLite DB
                                    let state = app.state::<crate::AppState>();
                                    if let Ok(conn) = state.db.lock() {
                                        let _ = conn.execute(
                                            "INSERT OR IGNORE INTO messages (id, senderId, receiverId, text, timestamp) VALUES (?1, ?2, ?3, ?4, ?5)",
                                            (&chat.id, &chat.sender_id, &chat.receiver_id, &chat.text, &chat.timestamp),
                                        );
                                    }
                                    
                                    app.emit("chat_message_received", chat.clone()).ok();
                                } else if chat.msg_type == "like" {
                                    println!("[P2P] Received Like from {}", chat.sender_id);
                                    app.emit("like_received", chat.clone()).ok();
                                }
                            }
                        }
                        _ => {}
                    }
                }
            }
        });
    });
}

pub fn broadcast_profile(profile: PeerProfile) {
    if let Ok(encoded) = serde_json::to_vec(&profile) {
        unsafe {
            if let Some(ref tx) = BROADCAST_TX {
                tx.send(encoded).ok();
            }
        }
    }
}

pub fn broadcast_chat(chat: ChatMessage) {
    if let Ok(encoded) = serde_json::to_vec(&chat) {
        unsafe {
            if let Some(ref tx) = BROADCAST_TX {
                tx.send(encoded).ok();
            }
        }
    }
}
