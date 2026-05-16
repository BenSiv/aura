import { useState, useEffect, useCallback } from "react";
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { Profile } from "../components/SwipeCard";
import { DEMO_CONFIG } from "../demo/demoConfig";
import { DEMO_PROFILES } from "../demo/demoData";

export type VisibilityMode = "cloaked" | "resonant" | "public";

export function useResonance() {
  const [activeAura, setActiveAura] = useState(true);
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>("resonant");
  const [pendingDiscoveries, setPendingDiscoveries] = useState<Profile[]>([]);
  const [localProfile, setLocalProfile] = useState<{ id: string, name: string, bio: string, images: string, tags: string, gender: string, interestedIn: string } | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(!DEMO_CONFIG.IS_DEMO_MODE);

  const startBroadcasting = useCallback((profile: any) => {
    // Shout our presence every 10 seconds
    invoke("start_broadcasting", { profile });
    const interval = setInterval(() => {
      invoke("start_broadcasting", { profile });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (DEMO_CONFIG.FORCE_RESET_ON_LAUNCH) {
      setLocalProfile(null);
      setIsInitialLoading(false);
      return;
    }

    // Standard Core Logic (Non-demo)
    invoke<{ id: string, name: string, bio: string, tags: string, images?: string, gender: string, interestedIn: string } | null>("get_local_profile")
      .then((profile) => {
        if (profile) {
          setLocalProfile(profile as any);
          startBroadcasting(profile);
        }
        setIsInitialLoading(false);
      });

    // Listen for background mesh proximity events
    const unlisten = listen<any>('resonance_detected', (event) => {
      const { score, peer_data } = event.payload;
      
      if (peer_data) {
        setPendingDiscoveries(prev => {
          if (prev.some(p => p.id === peer_data.id)) return prev;
          
          // Construct profile from peer_data with aggressive fallbacks
          const newPeer: Profile = {
            id: peer_data.id || crypto.randomUUID(),
            name: peer_data.name || "Unknown Resonance",
            bio: peer_data.bio || "An unidentified energy signature has been detected.",
            images: peer_data.images || "[]",
            tags: peer_data.tags || "[]",
            gender: peer_data.gender || "Other",
            distance: Math.round(score * 10) / 10
          };

          return [...prev, newPeer];
        });
      }
    });

    return () => {
      unlisten.then(f => f());
    };
  }, [startBroadcasting]);

  const cycleVisibility = () => {
    const modes: VisibilityMode[] = ["cloaked", "resonant", "public"];
    setVisibilityMode(modes[(modes.indexOf(visibilityMode) + 1) % modes.length]);
  };

  const handleSaveProfile = async (name: string, bio: string, tags: string, image: string, gender: string, interestedIn: string) => {
    const newProfile = {
      id: crypto.randomUUID(),
      name,
      bio,
      tags,
      images: JSON.stringify([image]),
      gender,
      interested_in: interestedIn // Match Rust naming
    };

    if (DEMO_CONFIG.BYPASS_DB_PERSISTENCE) {
      setLocalProfile(newProfile as any);
      
      // Filter seed profiles based on interest for demo
      if (DEMO_CONFIG.USE_SEED_PROFILES) {
        const filtered = DEMO_PROFILES.filter(p => {
          if (interestedIn === "Both") return true;
          if (interestedIn === "Men") return p.gender === "Man";
          if (interestedIn === "Women") return p.gender === "Woman";
          return true;
        });
        setPendingDiscoveries(filtered);
      }
      return;
    }

    try {
      await invoke("save_local_profile", { profile: newProfile });
      setLocalProfile(newProfile as any);
      startBroadcasting(newProfile);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const handleInteraction = (type: 'like' | 'pass') => {
    if (type === 'like' && pendingDiscoveries.length > 0 && DEMO_CONFIG.INSTANT_MATCH_ON_LIKE) {
      setMatchedProfile(pendingDiscoveries[0]);
    }
    setPendingDiscoveries(prev => prev.slice(1));
  };

  return {
    activeAura,
    setActiveAura,
    visibilityMode,
    setVisibilityMode,
    pendingDiscoveries,
    localProfile,
    isInitialLoading,
    cycleVisibility,
    handleSaveProfile,
    handleInteraction,
    matchedProfile,
    setMatchedProfile
  };
}
