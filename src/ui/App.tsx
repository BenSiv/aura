import { useState, useEffect } from "react";
import { Radar, Shield, Zap } from "lucide-react";
import { useResonance } from "./hooks/useResonance";
import { listen, invoke } from "./services/tauri";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { DiscoveryScreen } from "./screens/DiscoveryScreen";
import { ProfileDetailOverlay } from "./screens/ProfileDetailOverlay";
import { Profile } from "./components/SwipeCard";
import { MatchScreen } from "./screens/MatchScreen";
import { ChatScreen } from "./screens/ChatScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { Sidebar } from "./components/Sidebar";
import { ChatsScreen } from "./screens/ChatsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
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
    handleInteraction,
    matchedProfile,
    setMatchedProfile,
    theme,
    toggleTheme,
    zkThreshold,
    updateZkThreshold,
    minAge,
    updateMinAge,
    maxAge,
    updateMaxAge,
    emailAddress,
    updateEmailAddress,
    useCustomEmail,
    toggleUseCustomEmail,
    emailPassword,
    updateEmailPassword,
    imapServer,
    updateImapServer,
    smtpServer,
    updateSmtpServer
  } = useResonance();

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showChatsList, setShowChatsList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ senderId: string; text: string } | null>(null);

  useEffect(() => {
    // Request system notification permissions on onboarding/launch
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const unlisten = listen<any>('chat_message_received', (event) => {
      const msg = event.payload;
      
      // Popup toast banner only if we aren't already looking at their active chat window
      if (!showChat || (matchedProfile && matchedProfile.id !== msg.sender_id)) {
        setToast({ senderId: msg.sender_id, text: msg.text });
        
        // Native local system notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification("New Aura Message", {
            body: msg.text,
            icon: "/favicon.png"
          });
        }
      }
    });

    return () => {
      unlisten.then(f => f());
    };
  }, [showChat, matchedProfile]);

  // Toast Auto-Dismissal Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getVisibilityInfo = () => {
    if (visibilityMode === "cloaked") return { icon: <Shield size={20} />, label: "Cloaked", desc: "Private mode. You are invisible to others but can still discover nearby resonance." };
    if (visibilityMode === "resonant") return { icon: <Radar size={20} />, label: "Resonant", desc: "Standard mode. Discover and be discovered by people with matching energy." };
    return { icon: <Zap size={20} />, label: "Public", desc: "High visibility. Your resonance is boosted to reach more people in the mesh." };
  };

  if (isInitialLoading) return null;

  if (!localProfile || showProfileEdit) {
    return <OnboardingScreen 
      initialProfile={localProfile || undefined}
      onSave={(...args) => {
        handleSaveProfile(...args);
        setShowProfileEdit(false);
      }} 
    />;
  }

  if (showChat && matchedProfile) {
    return <ChatScreen profile={matchedProfile} localProfileId={localProfile.id} onBack={() => setShowChat(false)} />;
  }

  if (showHistory) {
    return <HistoryScreen onBack={() => setShowHistory(false)} />;
  }

  if (showChatsList) {
    return <ChatsScreen 
      onBack={() => setShowChatsList(false)} 
      onSelectChat={(profile) => {
        setMatchedProfile(profile);
        setShowChat(true);
        setShowChatsList(false);
      }} 
    />;
  }

  if (showSettings) {
    return (
      <SettingsScreen 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onBack={() => setShowSettings(false)} 
        zkThreshold={zkThreshold}
        onUpdateZkThreshold={updateZkThreshold}
        minAge={minAge}
        onUpdateMinAge={updateMinAge}
        maxAge={maxAge}
        onUpdateMaxAge={updateMaxAge}
        emailAddress={emailAddress}
        onUpdateEmailAddress={updateEmailAddress}
        useCustomEmail={useCustomEmail}
        onToggleUseCustomEmail={toggleUseCustomEmail}
        emailPassword={emailPassword}
        onUpdateEmailPassword={updateEmailPassword}
        imapServer={imapServer}
        onUpdateImapServer={updateImapServer}
        smtpServer={smtpServer}
        onUpdateSmtpServer={updateSmtpServer}
      />
    );
  }

  return (
    <>
      {toast && (
        <div className="toast-notification fade-in" onClick={() => {
          if (matchedProfile && matchedProfile.id === toast.senderId) {
            setShowChat(true);
          } else {
            const found = pendingDiscoveries.find(p => p.id === toast.senderId);
            if (found) {
              setMatchedProfile(found);
              setShowChat(true);
            }
          }
          setToast(null);
        }}>
          <div className="toast-header">
            <span className="toast-badge">New Aura Message</span>
            <span className="toast-time">Just now</span>
          </div>
          <p className="toast-body">{toast.text}</p>
        </div>
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(view) => {
          setIsSidebarOpen(false);
          // Reset all views first
          setShowProfileEdit(false);
          setShowHistory(false);
          setShowChatsList(false);
          setShowSettings(false);
          setShowChat(false);

          if (view === "profile") setShowProfileEdit(true);
          if (view === "swipes") setShowHistory(true);
          if (view === "chats") setShowChatsList(true);
          if (view === "settings") setShowSettings(true);
        }}
      />

      <DiscoveryScreen 
        activeAura={activeAura}
        setActiveAura={setActiveAura}
        cycleVisibility={cycleVisibility}
        pendingDiscoveries={pendingDiscoveries}
        handleInteraction={handleInteraction}
        setSelectedProfile={setSelectedProfile}
        visibilityInfo={getVisibilityInfo()}
        onOpenMenu={() => setIsSidebarOpen(true)}
      />

      {selectedProfile && (
        <ProfileDetailOverlay 
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onLike={() => handleInteraction('like')}
          onReport={async (reason) => {
            try {
              const attributes = reason ? `report:inappropriate:${reason}` : "report:inappropriate";
              await invoke("submit_peer_feedback", {
                targetProfileId: selectedProfile.id,
                rating: 0.0,
                attributes
              });
              handleInteraction('pass');
              setSelectedProfile(null);
            } catch (err) {
              console.error("Failed to submit peer report:", err);
            }
          }}
        />
      )}

      {matchedProfile && !showChat && (
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
