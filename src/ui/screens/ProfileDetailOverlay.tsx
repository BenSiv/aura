import React, { useState } from "react";
import { X, Radar } from "lucide-react";
import { Profile } from "../components/SwipeCard";

interface ProfileDetailOverlayProps {
  profile: Profile;
  onClose: () => void;
  onLike: () => void;
  onReport: (reason: string) => void;
}

export const ProfileDetailOverlay: React.FC<ProfileDetailOverlayProps> = ({
  profile,
  onClose,
  onLike,
  onReport
}) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reason, setReason] = useState("");

  if (isReporting) {
    return (
      <div className="profile-detail-overlay" onClick={onClose}>
        <div className="profile-detail-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px' }}>
          <div className="profile-detail-body" style={{ padding: '2rem' }}>
            <h2 style={{ color: '#ff6384', marginBottom: '0.5rem' }}>Report Profile</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              In Aura's P2P mesh network, reporting immediately blocks this user locally and cryptographically broadcasts a trust-dampening warning to nearby peers.
            </p>
            
            <div className="detail-section" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Reasoning for report (optional):
              </label>
              <textarea 
                placeholder="e.g. offensive language, spam/bot advertisement, harassment..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                style={{
                  width: '100%',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-secondary" 
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: '#fff',
                  fontWeight: 600
                }}
                onClick={() => setIsReporting(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  background: '#ff6384', 
                  border: 'none', 
                  color: '#fff', 
                  fontWeight: 600 
                }}
                onClick={() => {
                  onReport(reason.trim());
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-detail-overlay" onClick={onClose}>
      <div className="profile-detail-content" onClick={e => e.stopPropagation()}>
        <div className="profile-detail-header">
          <img src={JSON.parse(profile.images)[0]} alt={profile.name} />
          <button className="btn-close-detail" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="profile-detail-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <h2>{profile.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <Radar size={16} />
              <span>{Math.round(98)}% Resonance</span>
            </div>
          </div>
          
          <div className="detail-section">
            <h3>Resonance Bio</h3>
            <p>{profile.bio}</p>
            <p style={{ marginTop: '0.5rem' }}>
              This resonance was detected via the local mesh network. Their energy signature suggests a high compatibility with your current project settings.
            </p>
          </div>

          <div className="detail-section">
            <h3>Energy Tags</h3>
            <div className="swipe-card-tags">
              {JSON.parse(profile.tags || '[]').map((tag: string) => (
                <span key={tag} className="tag-chip">{tag}</span>
              ))}
            </div>
          </div>

          <div className="detail-section" style={{ marginTop: '2rem' }}>
            <button className="btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }} onClick={() => {
              onLike();
              onClose();
            }}>
              Establish Resonance
            </button>
            <button 
              className="btn-report" 
              style={{ 
                width: '100%', 
                background: 'rgba(255, 99, 132, 0.1)', 
                border: '1px solid rgba(255, 99, 132, 0.4)', 
                color: '#ff6384',
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s',
                textAlign: 'center'
              }} 
              onClick={() => {
                setIsReporting(true);
              }}
            >
              Report Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
