import React, { useState } from "react";
import { User, FileText, Tag } from "lucide-react";

interface OnboardingScreenProps {
  onSave: (name: string, bio: string, tags: string, image: string) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSave }) => {
  const [setupName, setSetupName] = useState("");
  const [setupBio, setSetupBio] = useState("");
  const [setupTags, setSetupTags] = useState("");
  const [setupImage, setSetupImage] = useState("https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80");

  const handleSave = () => {
    if (!setupName) return;
    onSave(setupName, setupBio, setupTags, setupImage);
  };

  return (
    <div className="app-container setup-screen">
      <header className="header">
        <div style={{ background: 'var(--accent-primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', width: 'fit-content', marginBottom: '1rem' }}>
          DEBUG: SCROLL V5 (APP-CONTAINER-FIX)
        </div>
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
          onClick={handleSave}
          disabled={!setupName}
        >
          Project Your Aura
        </button>
      </main>
    </div>
  );
};
