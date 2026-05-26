import React, { useState } from "react";
import { User, FileText, Tag, Calendar } from "lucide-react";

interface OnboardingScreenProps {
  initialProfile?: {
    id: string;
    name: string;
    bio: string;
    images: string;
    tags: string;
    gender: string;
    interestedIn: string;
    dob?: string;
  };
  onSave: (name: string, bio: string, tags: string, image: string, gender: string, interestedIn: string, dob: string) => void;
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
    const gender = initialProfile?.gender || "Man";
    if (gender === "Woman") {
      return "/default_eve.png";
    }
    return "/default_adam.png";
  };

  const [setupImage, setSetupImage] = useState(getInitialImage);
  const [setupGender, setSetupGender] = useState(initialProfile?.gender || "Man");
  const [setupInterestedIn, setSetupInterestedIn] = useState(initialProfile?.interestedIn || "Women");
  const [setupDob, setSetupDob] = useState(initialProfile?.dob || "");
  const [dobError, setDobError] = useState("");

  const handleGenderChange = (gender: string) => {
    setSetupGender(gender);
    const isCurrentlyDefault = setupImage === "/default_adam.png" || 
                               setupImage === "/default_eve.png" ||
                               setupImage === "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80&sat=-100" || 
                               setupImage === "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80&sat=-100";
    if (isCurrentlyDefault) {
      if (gender === "Man" || gender === "Other") {
        setSetupImage("/default_adam.png");
      } else if (gender === "Woman") {
        setSetupImage("/default_eve.png");
      }
    }
  };

  const getNamePlaceholder = () => {
    if (setupGender === "Man") return "e.g. Adam";
    if (setupGender === "Woman") return "e.g. Eve";
    return "e.g. Alex";
  };

  const validateDob = (val: string): boolean => {
    if (!val) {
      setDobError("");
      return true;
    }
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(val)) {
      setDobError("Please enter YYYY-MM-DD (e.g. 1998-04-20)");
      return false;
    }
    
    const parts = val.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      setDobError(`Year must be between 1900 and ${currentYear}`);
      return false;
    }
    if (month < 1 || month > 12) {
      setDobError("Month must be between 01 and 12");
      return false;
    }
    
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      setDobError(`Day must be between 01 and ${daysInMonth} for this month`);
      return false;
    }
    
    setDobError("");
    return true;
  };

  const handleSave = () => {
    if (!setupName || dobError !== "") return;
    onSave(setupName, setupBio, setupTags, setupImage, setupGender, setupInterestedIn, setupDob);
  };

  return (
    <div className="app-container setup-screen">
      <header className="header">
        <div className="header-top">
          <h1>Welcome</h1>
          <button 
            className="btn-primary btn-save-header" 
            onClick={handleSave}
            disabled={!setupName || dobError !== ""}
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
            placeholder={getNamePlaceholder()} 
            value={setupName}
            onChange={e => setSetupName(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label><Calendar size={16} /> Date of Birth (Optional)</label>
          <input 
            type="text" 
            placeholder="YYYY-MM-DD (e.g. 1998-04-20)" 
            value={setupDob}
            onChange={e => {
              const val = e.target.value;
              setSetupDob(val);
              validateDob(val);
            }}
            style={{
              borderColor: dobError ? 'rgba(255, 99, 132, 0.6)' : setupDob && !dobError ? 'rgba(75, 192, 192, 0.6)' : undefined,
              boxShadow: dobError ? '0 0 8px rgba(255, 99, 132, 0.2)' : setupDob && !dobError ? '0 0 8px rgba(75, 192, 192, 0.2)' : undefined,
              transition: 'all 0.3s ease'
            }}
          />
          {dobError && (
            <span style={{ 
              color: '#ff6384', 
              fontSize: '0.78rem', 
              marginTop: '4px', 
              display: 'block'
            }}>
              ⚠️ {dobError}
            </span>
          )}
          {setupDob && !dobError && (
            <span style={{ 
              color: '#4bc0c0', 
              fontSize: '0.78rem', 
              marginTop: '4px', 
              display: 'block' 
            }}>
              ✓ Format valid
            </span>
          )}
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
                  onClick={() => handleGenderChange(g)}
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
