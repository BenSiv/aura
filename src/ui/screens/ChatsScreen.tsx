import React, { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { invoke } from "../services/tauri";
import { Profile } from "../components/SwipeCard";

interface ChatsScreenProps {
  onBack: () => void;
  onSelectChat: (profile: Profile) => void;
}

export const ChatsScreen: React.FC<ChatsScreenProps> = ({ onBack, onSelectChat }) => {
  const [partners, setPartners] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartners = async () => {
      try {
        const rawPartners = await invoke<any[]>("get_chat_partners");
        const profiles = rawPartners.map(p => ({
          id: p.id,
          name: p.name,
          bio: p.bio,
          images: p.images || "[]",
          tags: p.tags || "[]",
          gender: p.gender || "Other",
          distance: 0
        }));
        setPartners(profiles);
      } catch (err) {
        console.error("Failed to load chat partners:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadPartners();
  }, []);

  return (
    <div className="app-container" style={{ padding: '20px' }}>
      <header className="header" style={{ marginBottom: '20px' }}>
        <button className="icon-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="brand">Active Resonances</div>
        <div style={{ width: 40 }} />
      </header>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>Syncing with the mesh...</p>
        ) : partners.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.6)' }}>
            <MessageSquare size={48} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
            <h2>No active chats</h2>
            <p>Resonate with others to start a conversation.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {partners.map((profile) => {
              let image = "/default_adam.png";
              try {
                const arr = JSON.parse(profile.images);
                if (arr.length > 0) image = arr[0];
              } catch(e) {}
              
              return (
                <div 
                  key={profile.id} 
                  onClick={() => onSelectChat(profile)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '16px',
                    padding: '12px',
                    cursor: 'pointer',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <img src={image} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>{profile.name}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Tap to open secure channel
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
