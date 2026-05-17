import React from "react";
import { X, User, Settings, MessageSquare, History } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: "profile" | "settings" | "chats" | "swipes") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="sidebar-content">
          <button className="sidebar-item" onClick={() => onNavigate("profile")}>
            <User size={20} />
            <span>Profile</span>
          </button>
          <button className="sidebar-item" onClick={() => onNavigate("settings")}>
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button className="sidebar-item" onClick={() => onNavigate("chats")}>
            <MessageSquare size={20} />
            <span>Chats</span>
          </button>
          <button className="sidebar-item" onClick={() => onNavigate("swipes")}>
            <History size={20} />
            <span>Swipes</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <p>Aura v0.1.0</p>
          <p>Local-First Mesh Networking</p>
        </div>
      </div>
    </div>
  );
};
