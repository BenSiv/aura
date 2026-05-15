import { MapPin } from 'lucide-react';

export interface Profile {
  id: string;
  name: string;
  bio: string;
  images: string; // JSON string array
  tags: string;   // JSON string array
  distance: number;
}

interface Props {
  profile: Profile;
}

export default function SwipeCard({ profile }: Props) {
  const images = JSON.parse(profile.images);
  const tags = JSON.parse(profile.tags || '[]');

  return (
    <div className="swipe-card">
      <img src={images[0]} alt={profile.name} className="swipe-card-image" />
      
      <div className="swipe-card-gradient" />

      <div className="swipe-card-content">
        <div className="swipe-card-header">
          <h2 className="swipe-card-name">{profile.name}</h2>
          <div className="swipe-card-distance">
            <MapPin size={14} />
            <span>{profile.distance} km away</span>
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
    </div>
  );
}
