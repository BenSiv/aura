import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Mail, Zap } from "lucide-react";
import { Profile } from "../components/SwipeCard";
import { invoke, listen } from "../services/tauri";

interface ChatScreenProps {
  profile: Profile;
  localProfileId: string;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  timestamp: number;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ profile, localProfileId, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [rating, setRating] = useState<number>(3.0); // Default to 3.0 stars
  const [transport, setTransport] = useState<"mesh" | "email">("mesh");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  let profileImage = "/default_adam.png";
  try {
    const images = JSON.parse(profile.images);
    if (images.length > 0) profileImage = images[0];
  } catch(e) {}

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Determine transport failover dynamically on mount/profile changes
  useEffect(() => {
    const hasEmailConfig = localStorage.getItem("email-address");
    // If peer is not within local mesh proximity range or ZK failed, failover to email mode
    if (
      profile.zkStatus === "failed" || 
      profile.distanceLabel?.includes("Remote") || 
      profile.distanceLabel?.includes("failed") ||
      profile.distance > 500
    ) {
      if (hasEmailConfig) {
        setTransport("email");
      }
    } else {
      setTransport("mesh");
    }
  }, [profile]);

  // Load history and rating, and set up listener
  useEffect(() => {
    const loadMessagesAndRating = async () => {
      try {
        const history = await invoke<ChatMessage[]>("get_chat_history", { peerId: profile.id });
        setMessages(history);
        
        // Fetch current rating for this peer
        const ratingData = await invoke<[number, string] | null>("get_peer_feedback", { targetProfileId: profile.id });
        if (ratingData) {
          setRating(ratingData[0]); // ratingData is [rating, attributes]
        }
      } catch (err) {
        console.error("Failed to load chat history or rating:", err);
      }
    };
    
    loadMessagesAndRating();

    // Listen for real-time mesh messages
    const unlisten = listen<ChatMessage>('chat_message_received', (event) => {
      const msg = event.payload;
      // Only add to UI if it's from this peer
      if (msg.sender_id === profile.id || msg.receiver_id === profile.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
        });
      }
    });

    return () => {
      unlisten.then(f => f());
    };
  }, [profile.id]);

  // Periodically poll Email Bridge for incoming IMAP chat bubbles
  useEffect(() => {
    if (transport !== "email") return;

    const pollInterval = setInterval(async () => {
      const email = localStorage.getItem("email-address") || "";
      const password = localStorage.getItem("email-password") || "";
      const imap_server = localStorage.getItem("imap-server") || "";
      const smtp_server = localStorage.getItem("smtp-server") || "";

      if (!email || !password || !imap_server) return;

      try {
        const emailMessagesJson = await invoke<string[]>("poll_email_chat_messages", {
          config: { email, password, imap_server, smtp_server }
        });

        for (const jsonStr of emailMessagesJson) {
          try {
            const chatMsg = JSON.parse(jsonStr);
            if (chatMsg.sender_id === profile.id || chatMsg.receiver_id === profile.id) {
              setMessages(prev => {
                if (prev.some(m => m.id === chatMsg.id)) return prev;
                return [...prev, chatMsg].sort((a, b) => a.timestamp - b.timestamp);
              });
            }
          } catch (e) {
            console.error("Failed to parse email message JSON:", e);
          }
        }
      } catch (err) {
        console.warn("Failed to poll email bridge messages:", err);
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [transport, profile.id]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    const text = newMessage.trim();
    setNewMessage("");
    
    const timestamp = Math.floor(Date.now() / 1000);
    const id = `msg_${localProfileId}_${timestamp}`;

    const chatMsg: ChatMessage = {
      id,
      sender_id: localProfileId,
      receiver_id: profile.id,
      text,
      timestamp
    };

    try {
      if (transport === "email") {
        const email = localStorage.getItem("email-address") || "";
        const password = localStorage.getItem("email-password") || "";
        const imap_server = localStorage.getItem("imap-server") || "";
        const smtp_server = localStorage.getItem("smtp-server") || "";
        
        // Derive standard federated email target for peer
        const peerEmail = `${profile.name.toLowerCase().replace(/\s+/g, "")}@auramail.net`;
        
        await invoke("send_email_chat_message", {
          config: { email, password, imap_server, smtp_server },
          toEmail: peerEmail,
          messageJson: JSON.stringify(chatMsg)
        });

        // Save locally to SQLCipher DB history as well
        await invoke("send_chat_message", { 
          senderId: localProfileId, 
          receiverId: profile.id, 
          text 
        });
      } else {
        await invoke("send_chat_message", { 
          senderId: localProfileId, 
          receiverId: profile.id, 
          text 
        });
      }
      
      // Optimistically add to UI
      setMessages(prev => [...prev, chatMsg]);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleRatingChange = async (val: number) => {
    setRating(val);
    try {
      await invoke("submit_peer_feedback", {
        targetProfileId: profile.id,
        rating: val,
        attributes: "rating"
      });
    } catch (err) {
      console.error("Failed to submit peer rating:", err);
    }
  };

  return (
    <div className="app-container chat-screen">
      <header className="header chat-header">
        <button className="btn-icon" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="chat-peer-info" style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, marginLeft: '10px' }}>
          <img src={profileImage} alt={profile.name} className="chat-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <div className="chat-peer-details">
            <h2 className="chat-peer-name" style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>{profile.name}</h2>
            <div className="chat-peer-status" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', marginTop: '2px' }}>
              <span 
                className="status-dot" 
                style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: transport === 'mesh' ? '#10B981' : 'var(--accent-primary)',
                  display: 'inline-block'
                }}
              ></span> 
              <span style={{ color: 'var(--text-secondary)' }}>
                {transport === 'mesh' ? 'Active in Mesh' : 'Bridged via Email'}
              </span>
            </div>
          </div>
        </div>
        <div style={{ width: 40 }}></div>
      </header>

      <div 
        className="chat-proximity-warning"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}
      >
        {transport === 'mesh' ? (
          <>
            <Zap size={14} style={{ color: '#10B981' }} />
            <span>P2P Encrypted Mesh Communication Active</span>
          </>
        ) : (
          <>
            <Mail size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Bridged over SMTP/IMAP (Autocrypt Encrypted)</span>
          </>
        )}
      </div>

      <main className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: '40px 0', opacity: 0.5 }}>
            <p>Send a message to break the ice.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-bubble ${msg.sender_id === localProfileId ? 'sent' : 'received'}`}
              style={{
                alignSelf: msg.sender_id === localProfileId ? 'flex-end' : 'flex-start',
                background: msg.sender_id === localProfileId ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-primary)',
                padding: '10px 16px',
                borderRadius: msg.sender_id === localProfileId ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                maxWidth: '75%',
                fontSize: '0.9rem',
                boxShadow: msg.sender_id === localProfileId ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
              }}
            >
              {msg.text}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="chat-rating-bar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1.2rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        gap: '16px'
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '150px' }}>
          Resonance Rating: <strong style={{ color: 'var(--accent-primary)' }}>{rating.toFixed(1)}/5.0</strong>
        </span>
        <input 
          type="range" 
          min="0" 
          max="5" 
          step="0.5" 
          value={rating} 
          onChange={(e) => handleRatingChange(parseFloat(e.target.value))}
          style={{ 
            flexGrow: 1, 
            accentColor: 'var(--accent-primary)', 
            cursor: 'pointer',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.2)'
          }}
        />
      </div>

      <footer className="chat-input-area" style={{ padding: '15px', background: 'rgba(0, 0, 0, 0.2)' }}>
        <div className="input-wrapper" style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '4px 8px 4px 16px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder={transport === 'mesh' ? "Send local mesh message..." : "Send long-range email message..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              padding: '10px 0'
            }}
          />
          <button 
            className="send-btn" 
            onClick={handleSend} 
            disabled={!newMessage.trim()}
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: newMessage.trim() ? 1 : 0.5,
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
};
