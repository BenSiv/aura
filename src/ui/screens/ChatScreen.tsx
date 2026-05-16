import React, { useState } from "react";
import { ArrowLeft, Send, MoreVertical } from "lucide-react";
import { Profile } from "../components/SwipeCard";

interface ChatScreenProps {
  profile: Profile;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ profile, onBack }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! I saw your Aura and felt a great connection.", sender: "them", time: "12:05 PM" },
    { id: 2, text: "Your tags caught my eye, specifically the mesh networking part!", sender: "them", time: "12:06 PM" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  const profileImage = JSON.parse(profile.images)[0];

  return (
    <div className="app-container chat-screen">
      <header className="header chat-header">
        <button className="btn-icon" onClick={onBack}><ArrowLeft size={20} /></button>
        <div className="chat-peer-info">
          <img src={profileImage} alt={profile.name} className="chat-avatar" />
          <div>
            <h3>{profile.name}</h3>
            <span className="status-text">Online</span>
          </div>
        </div>
        <button className="btn-icon"><MoreVertical size={20} /></button>
      </header>

      <main className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message-bubble ${msg.sender}`}>
            <p>{msg.text}</p>
            <span className="message-time">{msg.time}</span>
          </div>
        ))}
      </main>

      <footer className="chat-input-area">
        <input 
          type="text" 
          placeholder="Send a resonant message..." 
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
        />
        <button className="btn-send" onClick={handleSend} disabled={!inputValue.trim()}>
          <Send size={20} />
        </button>
      </footer>
    </div>
  );
};
