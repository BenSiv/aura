import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  let profileImage = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80";
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

    // Listen for real-time messages
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

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    const text = newMessage.trim();
    setNewMessage("");
    
    try {
      await invoke("send_chat_message", { 
        senderId: localProfileId, 
        receiverId: profile.id, 
        text 
      });
      
      // Optimistically add to UI
      const optimisticMsg: ChatMessage = {
        id: `optimistic_${Date.now()}`,
        sender_id: localProfileId,
        receiver_id: profile.id,
        text,
        timestamp: Math.floor(Date.now() / 1000)
      };
      setMessages(prev => [...prev, optimisticMsg]);
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
        <button className="icon-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="chat-peer-info">
          <img src={profileImage} alt={profile.name} className="chat-avatar" />
          <div className="chat-peer-details">
            <h2 className="chat-peer-name">{profile.name}</h2>
            <div className="chat-peer-status">
              <span className="status-dot active"></span> Active in Mesh
            </div>
          </div>
        </div>
        <div style={{ width: 40 }}></div>
      </header>

      <div className="chat-proximity-warning">
        <Sparkles size={16} />
        <span>P2P Encrypted Mesh Communication Active</span>
      </div>

      <main className="chat-messages">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: '40px 0', opacity: 0.5 }}>
            <p>Send a message to break the ice.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-bubble ${msg.sender_id === localProfileId ? 'sent' : 'received'}`}
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

      <footer className="chat-input-area">
        <div className="input-wrapper">
          <input 
            type="text" 
            placeholder="Send a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            autoFocus
          />
          <button className="send-btn" onClick={handleSend} disabled={!newMessage.trim()}>
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
};
