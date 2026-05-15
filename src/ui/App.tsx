import { useState, useEffect } from "react";
import { listen } from '@tauri-apps/api/event';
import { Radar, Shield, Zap, X, Heart, Sparkles } from "lucide-react";
import SwipeCard, { Profile } from "./components/SwipeCard";
import "./App.css";

function App() {
  const [activeAura, setActiveAura] = useState(true);
  const [visibilityMode, setVisibilityMode] = useState<"cloaked" | "resonant" | "public">("resonant");
  const [pendingDiscoveries, setPendingDiscoveries] = useState<Profile[]>([]);

  useEffect(() => {
    // Listen for background mesh proximity events
    const unlisten = listen<any>('resonance_detected', (event) => {
      // Add the simulated event profile to the inbox
      setPendingDiscoveries(prev => [...prev, {
        id: event.payload.profile_id,
        name: "Simulated Match",
        bio: "A resonance was detected nearby. They seem to match your energy perfectly.",
        images: JSON.stringify(["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"]),
        tags: JSON.stringify(["travel", "coffee", "art", "music"]),
        distance: 0.5
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

  const getVisibilityIcon = () => {
    if (visibilityMode === "cloaked") return <Shield size={20} />;
    if (visibilityMode === "resonant") return <Radar size={20} />;
    return <Zap size={20} />;
  };

  const handleInteraction = (_type: 'like' | 'pass') => {
    // In reality, this would invoke a Rust command to save the interaction and train the ML
    setPendingDiscoveries(prev => prev.slice(1));
  };

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>Aura</h1>
          <div className="status-pill">
            <div className={`status-dot ${activeAura ? "active" : "idle"}`} />
            <span>{activeAura ? "Projecting Resonance" : "Aura Idle"}</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={cycleVisibility}>
            {getVisibilityIcon()}
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
      </header>

      <main className="main-content">
        {pendingDiscoveries.length > 0 ? (
          <div style={{ width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700 }}>
              <Sparkles size={20} /> Nearby Resonance
            </div>
            
            <div className="swipe-stack">
              <SwipeCard profile={pendingDiscoveries[0]} />
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
    </div>
  );
}

export default App;
