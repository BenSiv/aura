import { useState, useEffect } from "react";
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { Radar, Shield, Zap, X, Heart, Sparkles, User, Tag, FileText } from "lucide-react";
import SwipeCard, { Profile } from "./components/SwipeCard";
import "./App.css";

function App() {
  const [activeAura, setActiveAura] = useState(true);
  const [visibilityMode, setVisibilityMode] = useState<"cloaked" | "resonant" | "public">("resonant");
  const [pendingDiscoveries, setPendingDiscoveries] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [localProfile, setLocalProfile] = useState<{ id: string, name: string, bio: string, tags: string } | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Profile setup form state
  const [setupName, setSetupName] = useState("");
  const [setupBio, setSetupBio] = useState("");
  const [setupTags, setSetupTags] = useState("");
  const [setupImage, setSetupImage] = useState("https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80");

  useEffect(() => {
    // Fetch local profile on load
    invoke<{ id: string, name: string, bio: string, tags: string, images?: string } | null>("get_local_profile")
      .then((profile) => {
        if (profile) {
          setLocalProfile(profile as any);
          startBroadcasting(profile);
        }
        setIsInitialLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch local profile:", err);
        setIsInitialLoading(false);
      });

    // Listen for background mesh proximity events
    const unlisten = listen<any>('resonance_detected', (event) => {
      const { profile_id, score, peer_data } = event.payload;
      
      // If we got real data from another device, use it!
      if (peer_data) {
        setPendingDiscoveries(prev => {
          if (prev.some(p => p.id === peer_data.id)) return prev;
          return [...prev, {
            id: peer_data.id,
            name: peer_data.name,
            bio: peer_data.bio,
            images: peer_data.images,
            tags: peer_data.tags,
            distance: Math.round(score * 10) / 10
          }];
        });
        return;
      }

      const simulatedProfiles: Record<string, Partial<Profile>> = {
        "simulated_user_alex": {
          name: "Alex Rivera",
          bio: "Building the future of decentralized networks. Passionate about mesh technology and sustainable energy.",
          images: JSON.stringify(["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80"]),
          tags: JSON.stringify(["coding", "mesh", "solarpunk"]),
        },
        "simulated_user_jamie": {
          name: "Jamie Chen",
          bio: "Digital artist and coffee enthusiast. I love exploring the intersection of technology and human connection.",
          images: JSON.stringify(["https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"]),
          tags: JSON.stringify(["art", "coffee", "ui/ux"]),
        },
        "simulated_user_sam": {
          name: "Sam Wilson",
          bio: "Adventure seeker and photographer. Usually found in the mountains or at a concert.",
          images: JSON.stringify(["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"]),
          tags: JSON.stringify(["hiking", "photo", "music"]),
        }
      };

      const baseProfile = simulatedProfiles[profile_id] || {
        name: "Unknown Resonance",
        bio: "An unidentified energy signature has been detected.",
        images: JSON.stringify(["https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80"]),
        tags: "[]",
      };

      // Add the event profile to the inbox
      setPendingDiscoveries(prev => [...prev, {
        id: profile_id,
        name: baseProfile.name!,
        bio: baseProfile.bio!,
        images: baseProfile.images!,
        tags: baseProfile.tags!,
        distance: Math.round(score * 10) / 10
      }]);
    });

    return () => {
      unlisten.then(f => f());
    };
  }, []);

  const cycleVisibility = () => {
    const modes: ("cloaked" | "resonant" | "public")[] = ["cloaked", "resonant", "public"];
    setVisibilityMode(modes[(modes.indexOf(visibilityMode) + 1) % modes.length]);
  };

  const getVisibilityInfo = () => {
    if (visibilityMode === "cloaked") return { icon: <Shield size={20} />, label: "Cloaked", desc: "Private mode. You are invisible to others and won't scan for resonance." };
    if (visibilityMode === "resonant") return { icon: <Radar size={20} />, label: "Resonant", desc: "Standard mode. Discover and be discovered by people with matching energy." };
    return { icon: <Zap size={20} />, label: "Public", desc: "High visibility. Your resonance is boosted to reach more people in the mesh." };
  };

  const { icon, label, desc } = getVisibilityInfo();

  const handleInteraction = (_type: 'like' | 'pass') => {
    // In reality, this would invoke a Rust command to save the interaction and train the ML
    setPendingDiscoveries(prev => prev.slice(1));
    setSelectedProfile(null);
  };

  const handleSaveProfile = () => {
    if (!setupName) return;
    const newProfile = {
      id: crypto.randomUUID(),
      name: setupName,
      bio: setupBio,
      tags: setupTags,
      images: JSON.stringify([setupImage])
    };
    invoke("save_local_profile", { profile: newProfile })
      .then(() => {
        setLocalProfile(newProfile as any);
        startBroadcasting(newProfile);
      })
      .catch(console.error);
  };

  const startBroadcasting = (profile: any) => {
    // Shout our presence every 10 seconds
    invoke("start_broadcasting", { profile });
    setInterval(() => {
      invoke("start_broadcasting", { profile });
    }, 10000);
  };

  if (isInitialLoading) return null;

  if (!localProfile) {
    return (
      <div className="app-container setup-screen">
        <header className="header">
          <h1>Welcome to Aura</h1>
          <p>Set up your resonance profile to begin discovering others in the mesh network.</p>
        </header>
        <main className="main-content setup-form">
          <div className="setup-avatar-select">
            <img src={setupImage} alt="Profile" onClick={() => {
              const url = prompt("Enter an image URL for your avatar:", setupImage);
              if (url) setSetupImage(url);
            }} />
            <span>Tap image to change URL</span>
          </div>
          <div className="input-group">
            <label><User size={16} /> Public Name</label>
            <input 
              type="text" 
              placeholder="e.g. Alex" 
              value={setupName}
              onChange={e => setSetupName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label><FileText size={16} /> Resonance Bio</label>
            <textarea 
              placeholder="What kind of energy are you projecting today?"
              value={setupBio}
              onChange={e => setSetupBio(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label><Tag size={16} /> Resonance Tags (comma separated)</label>
            <input 
              type="text" 
              placeholder="e.g. coding, music, art"
              value={setupTags}
              onChange={e => setSetupTags(e.target.value)}
            />
          </div>
          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '2rem' }}
            onClick={handleSaveProfile}
            disabled={!setupName}
          >
            Project Your Aura
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <div>
            <h1>Aura</h1>
            <div className="status-pill">
              <div className={`status-dot ${activeAura ? "active" : "idle"}`} />
              <span>{activeAura ? "Projecting" : "Idle"}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-mode-toggle" onClick={cycleVisibility}>
              {icon}
              <span className="mode-label">{label}</span>
            </button>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={activeAura} 
                onChange={(e) => setActiveAura(e.target.checked)} 
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <div className="mode-description">
          {desc}
        </div>
      </header>

      <main className="main-content">
        {pendingDiscoveries.length > 0 ? (
          <div style={{ width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700 }}>
              <Sparkles size={20} /> Nearby Resonance
            </div>
            
            <div className="swipe-stack">
              <SwipeCard 
                profile={pendingDiscoveries[0]} 
                onSwipe={handleInteraction} 
                onClick={() => setSelectedProfile(pendingDiscoveries[0])}
              />
            </div>

            <div className="swipe-actions">
              <button className="action-btn pass" onClick={() => handleInteraction('pass')}>
                <X size={32} />
              </button>
              <button className="action-btn like" onClick={() => handleInteraction('like')}>
                <Heart size={32} fill="currentColor" />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {activeAura ? (
              <>
                <div className="radar-container">
                  <div className="radar-ring"></div>
                  <div className="radar-ring"></div>
                  <div className="radar-ring"></div>
                  <Radar size={48} color="var(--accent-primary)" opacity={0.8} />
                </div>
                <p style={{ fontStyle: 'italic' }}>Scanning for nearby resonance...</p>
              </>
            ) : (
              <>
                <Shield size={64} color="var(--text-secondary)" opacity={0.5} style={{ marginBottom: '1rem' }} />
                <p style={{ fontStyle: 'italic' }}>Your Aura is currently cloaked.</p>
              </>
            )}
          </div>
        )}
      </main>

      {selectedProfile && (
        <div className="profile-detail-overlay" onClick={() => setSelectedProfile(null)}>
          <div className="profile-detail-content" onClick={e => e.stopPropagation()}>
            <div className="profile-detail-header">
              <img src={JSON.parse(selectedProfile.images)[0]} alt={selectedProfile.name} />
              <button className="btn-close-detail" onClick={() => setSelectedProfile(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="profile-detail-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <h2>{selectedProfile.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  <Radar size={16} />
                  <span>{Math.round(98)}% Resonance</span>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Resonance Bio</h3>
                <p>{selectedProfile.bio}</p>
                <p style={{ marginTop: '0.5rem' }}>
                  This resonance was detected via the local mesh network. Their energy signature suggests a high compatibility with your current project settings.
                </p>
              </div>

              <div className="detail-section">
                <h3>Energy Tags</h3>
                <div className="swipe-card-tags">
                  {JSON.parse(selectedProfile.tags || '[]').map((tag: string) => (
                    <span key={tag} className="tag-chip">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section" style={{ marginTop: '2rem' }}>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleInteraction('like')}>
                  Establish Resonance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
