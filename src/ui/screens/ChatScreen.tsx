import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { Profile } from "../components/SwipeCard";
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

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

  // Load history and set up listener
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const history = await invoke<ChatMessage[]>("get_chat_history", { peerId: profile.id });
        setMessages(history);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    
    loadMessages();

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
