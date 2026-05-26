import { useState, useRef, TouchEvent } from 'react';
import { MapPin, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

export interface Profile {
  id: string;
  name: string;
  bio: string;
  images: string; // JSON string array
  tags: string;   // JSON string array
  distance: number;
  gender?: string;
  zkStatus?: "unverified" | "verifying" | "verified_close" | "verified_far" | "failed";
  distanceLabel?: string;
  dob?: string;
}

export function calculateAge(dobString?: string): number | null {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

interface Props {
  profile: Profile;
  onSwipe: (type: 'like' | 'pass') => void;
  onClick: () => void;
}

export default function SwipeCard({ profile, onSwipe, onClick }: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  let images = [];
  try {
    images = JSON.parse(profile.images);
    if (!Array.isArray(images) || images.length === 0) throw new Error();
  } catch (e) {
    images = ["/default_adam.png"];
  }

  let tags = [];
  try {
    tags = JSON.parse(profile.tags || '[]');
  } catch (e) {
    tags = [];
  }

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    setOffsetX(diff);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    setIsDragging(false);
    const duration = Date.now() - startTime.current;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const distanceX = Math.abs(endX - startX.current);
    const distanceY = Math.abs(endY - startY.current);

    // If it was a short tap with very little movement, treat it as a click
    if (duration < 250 && distanceX < 10 && distanceY < 10) {
      onClick();
      setOffsetX(0);
      return;
    }

    const threshold = 100;
    if (offsetX > threshold) {
      onSwipe('like');
    } else if (offsetX < -threshold) {
      onSwipe('pass');
    }
    setOffsetX(0);
  };

  const rotation = offsetX / 10;
  const opacity = Math.max(1 - Math.abs(offsetX) / 500, 0.5);

  return (
    <div 
      ref={cardRef}
      className="swipe-card"
      style={{
        transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
        opacity: opacity,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
        touchAction: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
    >
      <img src={images[0]} alt={profile.name} className="swipe-card-image" />
      
      <div className="swipe-card-gradient" />

      <div className="swipe-card-content">
        <div className="swipe-card-header">
          <h2 className="swipe-card-name">
            {profile.name}
            {calculateAge(profile.dob) !== null && ` ${calculateAge(profile.dob)}`}
          </h2>
          <div className={`swipe-card-distance ${profile.zkStatus || 'unverified'}`}>
            {profile.zkStatus === 'verifying' && (
              <>
                <Shield size={14} className="pulse-icon" />
                <span>Verifying ZK Proximity...</span>
              </>
            )}
            {profile.zkStatus === 'verified_close' && (
              <>
                <ShieldCheck size={14} />
                <span>{profile.distanceLabel || 'Verified < 100m'}</span>
              </>
            )}
            {profile.zkStatus === 'failed' && (
              <>
                <ShieldAlert size={14} />
                <span>Remote / Spoofed Peer</span>
              </>
            )}
            {(!profile.zkStatus || profile.zkStatus === 'unverified' || profile.zkStatus === 'verified_far') && (
              <>
                <MapPin size={14} />
                <span>{profile.distance} km away</span>
              </>
            )}
          </div>
        </div>

        <div className="swipe-card-bio">
          <p>{profile.bio}</p>
        </div>

        <div className="swipe-card-tags">
          {tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
          {tags.length > 3 && (
            <span className="tag-chip tag-more">+{tags.length - 3}</span>
          )}
        </div>
      </div>

      {offsetX !== 0 && (
        <div className={`swipe-label ${offsetX > 0 ? 'like' : 'pass'}`} style={{ opacity: Math.min(Math.abs(offsetX) / 50, 1) }}>
          {offsetX > 0 ? 'RESONATE' : 'DAMPEN'}
        </div>
      )}
    </div>
  );
}
