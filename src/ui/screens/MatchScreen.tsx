import React from "react";
import { MessageSquare, ArrowRight } from "lucide-react";
import { Profile } from "../components/SwipeCard";

interface MatchScreenProps {
  localProfile: any;
  matchedProfile: Profile;
  onSendMessage: () => void;
  onContinue: () => void;
}

export const MatchScreen: React.FC<MatchScreenProps> = ({ 
  localProfile, 
  matchedProfile, 
  onSendMessage, 
  onContinue 
}) => {
  const localImage = localProfile.images ? JSON.parse(localProfile.images)[0] : "/default_adam.png";
  const matchedImage = JSON.parse(matchedProfile.images)[0];

  return (
    <div className="match-overlay">
      <div className="match-content">
        <h1 className="match-title">It's a Match!</h1>
        <p className="match-subtitle">You and {matchedProfile.name} have a resonant Aura.</p>
        
        <div className="match-avatars">
          <div className="match-avatar-container local">
            <img src={localImage} alt="You" />
          </div>
          <div className="match-avatar-container remote">
            <img src={matchedImage} alt={matchedProfile.name} />
          </div>
        </div>

        <div className="match-actions">
          <button className="btn-primary match-btn pulse" onClick={onSendMessage}>
            <MessageSquare size={20} />
            Send a Message
          </button>
          <button className="btn-secondary match-btn" onClick={onContinue}>
            Keep Swiping
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
