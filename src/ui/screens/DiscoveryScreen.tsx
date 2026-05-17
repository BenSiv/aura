import React from "react";
import { Radar, Sparkles, X, Heart, Shield, Menu } from "lucide-react";
import SwipeCard, { Profile } from "../components/SwipeCard";

interface DiscoveryScreenProps {
  activeAura: boolean;
  setActiveAura: (active: boolean) => void;
  cycleVisibility: () => void;
  pendingDiscoveries: Profile[];
  handleInteraction: (type: 'like' | 'pass') => void;
  setSelectedProfile: (profile: Profile) => void;
  visibilityInfo: { icon: React.ReactNode, label: string, desc: string };
  onOpenMenu: () => void;
}

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({
  activeAura,
  setActiveAura,
  cycleVisibility,
  pendingDiscoveries,
  handleInteraction,
  setSelectedProfile,
  visibilityInfo,
  onOpenMenu
}) => {
  const { icon, label, desc } = visibilityInfo;

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
            <button className="icon-btn" onClick={onOpenMenu} title="Menu">
              <Menu size={24} />
            </button>
            <button className="btn-mode-toggle" onClick={cycleVisibility}>
              {icon}
              <span className="mode-label">{label}</span>
            </button>
...

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
    </div>
  );
};
