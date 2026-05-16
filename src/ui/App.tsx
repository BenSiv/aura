import { useState } from "react";
import { Radar, Shield, Zap } from "lucide-react";
import { useResonance } from "./hooks/useResonance";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { DiscoveryScreen } from "./screens/DiscoveryScreen";
import { ProfileDetailOverlay } from "./screens/ProfileDetailOverlay";
import { Profile } from "./components/SwipeCard";
import { MatchScreen } from "./screens/MatchScreen";
import { ChatScreen } from "./screens/ChatScreen";
import "./App.css";

function App() {
  const {
    activeAura,
    setActiveAura,
    visibilityMode,
    pendingDiscoveries,
    localProfile,
    isInitialLoading,
    cycleVisibility,
    handleSaveProfile,
    handleInteraction
  } = useResonance();

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showChat, setShowChat] = useState(false);

  const getVisibilityInfo = () => {
    if (visibilityMode === "cloaked") return { icon: <Shield size={20} />, label: "Cloaked", desc: "Private mode. You are invisible to others and won't scan for resonance." };
    if (visibilityMode === "resonant") return { icon: <Radar size={20} />, label: "Resonant", desc: "Standard mode. Discover and be discovered by people with matching energy." };
    return { icon: <Zap size={20} />, label: "Public", desc: "High visibility. Your resonance is boosted to reach more people in the mesh." };
  };

  if (isInitialLoading) return null;

  if (!localProfile) {
    return <OnboardingScreen onSave={handleSaveProfile} />;
  }

  if (showChat && matchedProfile) {
    return <ChatScreen profile={matchedProfile} onBack={() => setShowChat(false)} />;
  }

  return (
    <>
      <DiscoveryScreen 
        activeAura={activeAura}
        setActiveAura={setActiveAura}
        cycleVisibility={cycleVisibility}
        pendingDiscoveries={pendingDiscoveries}
        handleInteraction={handleInteraction}
        setSelectedProfile={setSelectedProfile}
        visibilityInfo={getVisibilityInfo()}
      />

      {selectedProfile && (
        <ProfileDetailOverlay 
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onLike={() => handleInteraction('like')}
        />
      )}

      {matchedProfile && (
        <MatchScreen 
          localProfile={localProfile}
          matchedProfile={matchedProfile}
          onSendMessage={() => setShowChat(true)}
          onContinue={() => setMatchedProfile(null)}
        />
      )}
    </>
  );
}

export default App;
