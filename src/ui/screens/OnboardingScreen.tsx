import React, { useState } from "react";
import { User, FileText, Tag } from "lucide-react";

interface OnboardingScreenProps {
  initialProfile?: {
    id: string;
    name: string;
    bio: string;
    images: string;
    tags: string;
    gender: string;
    interestedIn: string;
  };
  onSave: (name: string, bio: string, tags: string, image: string, gender: string, interestedIn: string) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ initialProfile, onSave }) => {
  const [setupName, setSetupName] = useState(initialProfile?.name || "");
  const [setupBio, setSetupBio] = useState(initialProfile?.bio || "");
  const [setupTags, setSetupTags] = useState(initialProfile?.tags || "");
  
  const getInitialImage = () => {
    if (initialProfile?.images) {
      try {
        const parsed = JSON.parse(initialProfile.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch (e) {
        return initialProfile.images;
      }
    }
    return "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80";
  };

  const [setupImage, setSetupImage] = useState(getInitialImage);
  const [setupGender, setSetupGender] = useState(initialProfile?.gender || "Man");
  const [setupInterestedIn, setSetupInterestedIn] = useState(initialProfile?.interestedIn || "Women");

  const handleSave = () => {
    if (!setupName) return;
    onSave(setupName, setupBio, setupTags, setupImage, setupGender, setupInterestedIn);
  };

  return (
    <div className="app-container setup-screen">
      <header className="header">
        <div className="header-top">
          <h1>Welcome</h1>
          <button 
            className="btn-primary btn-save-header" 
            onClick={handleSave}
            disabled={!setupName}
          >
            Save Profile
          </button>
        </div>
        <p>Set up your resonance profile to begin.</p>
      </header>
      <main className="main-content setup-form">
        <div className="setup-avatar-select">
          <input 
            type="file" 
            id="avatar-upload" 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setSetupImage(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <img 
            src={setupImage} 
            alt="Profile" 
            onClick={() => document.getElementById('avatar-upload')?.click()} 
          />
          <span>Tap to upload photo</span>
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

        <div className="gender-selectors">
          <div className="input-group">
            <label>Your Gender</label>
            <div className="selector-group">
              {["Man", "Woman", "Other"].map(g => (
                <button 
                  key={g}
                  className={`selector-btn ${setupGender === g ? 'active' : ''}`}
                  onClick={() => setSetupGender(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Interested In</label>
            <div className="selector-group">
              {["Men", "Women", "Both"].map(i => (
                <button 
                  key={i}
                  className={`selector-btn ${setupInterestedIn === i ? 'active' : ''}`}
                  onClick={() => setSetupInterestedIn(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
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
      </main>
    </div>
  );
};
