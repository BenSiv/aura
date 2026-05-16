import React from "react";
import { X, Radar } from "lucide-react";
import { Profile } from "../components/SwipeCard";

interface ProfileDetailOverlayProps {
  profile: Profile;
  onClose: () => void;
  onLike: () => void;
}

export const ProfileDetailOverlay: React.FC<ProfileDetailOverlayProps> = ({
  profile,
  onClose,
  onLike
}) => {
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
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => {
              onLike();
              onClose();
            }}>
              Establish Resonance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
