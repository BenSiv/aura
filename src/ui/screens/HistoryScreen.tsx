import React, { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { invoke } from "../services/tauri";
import { Profile } from "../components/SwipeCard";

interface HistoryScreenProps {
  onBack: () => void;
}

interface HistoryItem {
  profileId: string;
  type: string;
  timestamp: number;
  profile?: Profile;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const rawHistory = await invoke<[string, string, number][]>("get_interaction_history");
        
        // Group and deduplicate by profile ID, keeping the most recent
        const historyMap = new Map<string, HistoryItem>();
        for (const [profileId, type, timestamp] of rawHistory) {
          if (!historyMap.has(profileId)) {
            historyMap.set(profileId, { profileId, type, timestamp });
          }
        }
        
        const uniqueHistory = Array.from(historyMap.values());
        
        // Fetch full profiles for these IDs
        if (uniqueHistory.length > 0) {
          const profileIds = uniqueHistory.map(h => h.profileId);
          const profiles = await invoke<any[]>("get_peer_profiles", { profileIds });
          
          const profileMap = new Map();
          for (const p of profiles) {
            profileMap.set(p.id, {
              id: p.id,
              name: p.name,
              bio: p.bio,
              images: p.images || "[]",
              tags: p.tags || "[]",
              gender: p.gender || "Other",
              distance: 0 // Distance isn't relevant in history
            });
          }
          
          uniqueHistory.forEach(h => {
            h.profile = profileMap.get(h.profileId);
          });
        }
        
        setHistory(uniqueHistory);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, []);

  const handleRevert = async (profileId: string) => {
    try {
      await invoke("revert_interaction", { profileId });
      setHistory(prev => prev.filter(h => h.profileId !== profileId));
      // In a full implementation, we'd also emit an event to add them back to the Discovery queue
    } catch (err) {
      console.error("Failed to revert:", err);
    }
  };

  return (
    <div className="app-container" style={{ padding: '20px' }}>
      <header className="header" style={{ marginBottom: '20px' }}>
        <button className="icon-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="brand">Aura History</div>
        <div style={{ width: 40 }} />
      </header>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>Accessing the chronological archive...</p>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.6)' }}>
            <RotateCcw size={48} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
            <h2>No history found</h2>
            <p>Your interactions will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {history.map((item) => {
              let image = "/default_adam.png";
              if (item.profile && item.profile.images) {
                try {
                  const arr = JSON.parse(item.profile.images);
                  if (arr.length > 0) image = arr[0];
                } catch(e) {}
              }
              
              return (
                <div key={item.profileId} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '16px',
                  padding: '12px',
                  border: `1px solid ${item.type === 'like' ? 'rgba(0,255,128,0.3)' : 'rgba(255,0,128,0.3)'}`
                }}>
                  <img src={image} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>{item.profile?.name || "Unknown Aura"}</h3>
                    <div style={{ 
                      fontSize: '12px', 
                      color: item.type === 'like' ? '#00ff80' : '#ff0080',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {item.type === 'like' ? 'Resonated' : 'Passed'} • {new Date(item.timestamp * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRevert(item.profileId)}
                    style={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      border: 'none', 
                      color: 'white', 
                      padding: '8px', 
                      borderRadius: '50%',
                      cursor: 'pointer'
                    }}
                    title="Revert Interaction"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
