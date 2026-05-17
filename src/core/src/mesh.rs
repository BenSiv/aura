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
    pub msg_type: String, // "chat", "blind_like", etc.
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
        BROADCAST_TX = Some(tx.clone());
    }

    let app_handle = app.clone();
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

            // --- SCF Forwarder Task ---
            let scf_app_handle = app_handle.clone();
            let scf_tx = tx.clone();
            tokio::spawn(async move {
                let mut interval = tokio::time::interval(Duration::from_secs(300)); // Every 5 mins
                loop {
                    interval.tick().await;
                    println!("[P2P] SCF: Checking carry_store for unexpired gossip...");
                    
                    let mut payloads_to_send = Vec::new();
                    
                    let state = scf_app_handle.state::<crate::AppState>();
                    if let Ok(conn) = state.db.lock() {
                        let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
                        if let Ok(mut stmt) = conn.prepare("SELECT payload FROM carry_store WHERE expiresAt > ?") {
                            if let Ok(rows) = stmt.query_map([now], |row| row.get::<_, Vec<u8>>(0)) {
                                for row in rows {
                                    if let Ok(data) = row {
                                        payloads_to_send.push(data);
                                    }
                                }
                            }
                        }
                    }

                    for data in payloads_to_send {
                        scf_tx.send(data).ok();
                    }
                }
            });

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
                            propagation_source: _peer_id,
                            message_id: _id,
                            message,
                        })) => {
                            let state = app_handle.state::<crate::AppState>();
                            
                            // --- Phase 3: Store for SCF ---
                            if let Ok(conn) = state.db.lock() {
                                let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
                                let expires = now + 86400; // 24 hour TTL
                                let mid = format!("msg_{}_{}", now, fastrand::u64(..));
                                let _ = conn.execute(
                                    "INSERT OR IGNORE INTO carry_store (id, payload, timestamp, expiresAt) VALUES (?1, ?2, ?3, ?4)",
                                    (&mid, &message.data, now, expires),
                                );
                            }

                            if let Ok(peer) = serde_json::from_slice::<PeerProfile>(&message.data) {
                                if !peer.id.is_empty() && peer.name.len() > 0 {
                                    println!("[P2P] Received Aura via Gossipsub from {}", peer.id);
                                    let res_event = ResonanceEvent {
                                        profile_id: peer.id.clone(),
                                        score: 1.0,
                                        timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
                                        peer_data: Some(peer),
                                    };
                                    app_handle.emit("resonance_detected", res_event).ok();
                                }
                            }
                            
                            if let Ok(chat) = serde_json::from_slice::<ChatMessage>(&message.data) {
                                if chat.msg_type == "chat" {
                                    println!("[P2P] Received Chat Message from {}", chat.sender_id);
                                    if let Ok(conn) = state.db.lock() {
                                        let _ = conn.execute(
                                            "INSERT OR IGNORE INTO messages (id, senderId, receiverId, text, timestamp) VALUES (?1, ?2, ?3, ?4, ?5)",
                                            (&chat.id, &chat.sender_id, &chat.receiver_id, &chat.text, &chat.timestamp),
                                        );
                                    }
                                    app_handle.emit("chat_message_received", chat.clone()).ok();
                                } else if chat.msg_type == "blind_like" {
                                    // Only process if it targets us
                                    let mut is_target = false;
                                    if let Ok(conn) = state.db.lock() {
                                        let my_id: String = conn.query_row("SELECT id FROM local_profile LIMIT 1", [], |r| r.get(0)).unwrap_or_default();
                                        if chat.receiver_id == my_id {
                                            is_target = true;
                                            let _ = conn.execute(
                                                "INSERT OR REPLACE INTO pending_likes (senderId, timestamp) VALUES (?1, ?2)",
                                                (&chat.sender_id, &chat.timestamp),
                                            );
                                        }
                                    }

                                    if is_target {
                                        println!("[P2P] Double-Blind: Received blind_like targeting us from {}", chat.sender_id);
                                        // Check for mutual match
                                        if let Ok(conn) = state.db.lock() {
                                            let count: i64 = conn.query_row(
                                                "SELECT COUNT(*) FROM interactions WHERE profileId = ? AND type = 'like'",
                                                [&chat.sender_id],
                                                |r| r.get(0)
                                            ).unwrap_or(0);

                                            if count > 0 {
                                                println!("[P2P] Double-Blind: MUTUAL MATCH with {}", chat.sender_id);
                                                app_handle.emit("mutual_match_established", chat.sender_id).ok();
                                            }
                                        }
                                    }
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
