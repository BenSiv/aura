import { useState, useEffect, useCallback, useRef } from "react";
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
  const myLikesRef = useRef<string[]>([]);
  const seenProfilesRef = useRef<Record<string, Profile>>({});
  const likesReceivedRef = useRef<string[]>([]);
  const localProfileRef = useRef<{ id: string, name: string, bio: string, images: string, tags: string, gender: string, interestedIn: string } | null>(null);

  // Initialize likes from DB
  useEffect(() => {
    invoke<any[]>("get_interaction_history").then(history => {
      const likes = history.filter(h => h[1] === "like").map(h => h[0]);
      myLikesRef.current = likes;
    }).catch(err => console.error("Failed to load interactions:", err));
  }, []);

  const startBroadcasting = useCallback((profile: any) => {
    invoke("start_broadcasting", { profile });
    
    // Clear any existing broadcast intervals to prevent stale broadcasts
    if ((window as any).broadcastInterval) {
      clearInterval((window as any).broadcastInterval);
    }
    
    (window as any).broadcastInterval = setInterval(() => {
      if (localProfileRef.current) {
        // Construct the payload to match what Rust expects
        const payload = {
          ...localProfileRef.current,
          interested_in: localProfileRef.current.interestedIn
        };
        invoke("start_broadcasting", { profile: payload });
      }
    }, 10000);
    
    return () => clearInterval((window as any).broadcastInterval);
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
          localProfileRef.current = profile as any;
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

          if (!DEMO_CONFIG.IS_DEMO_MODE) {
            invoke("save_peer_profile", { profile: newPeer }).catch(err => console.error("Failed to save peer:", err));
          }

          seenProfilesRef.current[newPeer.id] = newPeer;
          return [...prev, newPeer];
        });
      }
    });

    // Listen for incoming explicit "like" messages
    const unlistenLike = listen<any>('like_received', (event) => {
      const { sender_id, receiver_id } = event.payload;
      
      if (localProfileRef.current && receiver_id === localProfileRef.current.id) {
        // Record that they swiped Like on us
        if (!likesReceivedRef.current.includes(sender_id)) {
          likesReceivedRef.current = [...likesReceivedRef.current, sender_id];
        }

        // If we also swiped Like on them, trigger a mutual match!
        if (myLikesRef.current.includes(sender_id)) {
          const matched = seenProfilesRef.current[sender_id];
          if (matched) {
            setMatchedProfile(matched);
          }
        }
      }
    });

    return () => {
      unlisten.then(f => f());
      unlistenLike.then(f => f());
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
      localProfileRef.current = newProfile as any;
      startBroadcasting(newProfile);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const handleInteraction = (type: 'like' | 'pass') => {
    if (pendingDiscoveries.length > 0) {
      const targetPeer = pendingDiscoveries[0];
      
      if (!DEMO_CONFIG.IS_DEMO_MODE) {
        invoke("record_local_interaction", { profileId: targetPeer.id, interactionType: type }).catch(err => console.error("Failed to record interaction:", err));
        if (type === 'like') {
          myLikesRef.current = [...myLikesRef.current, targetPeer.id];
          
          // Check if they already liked us (symmetric match check!)
          if (likesReceivedRef.current.includes(targetPeer.id)) {
            setMatchedProfile(targetPeer);
          }
        }
      } else {
        // Fallback for demo instant matching
        if (type === 'like' && DEMO_CONFIG.INSTANT_MATCH_ON_LIKE) {
          setMatchedProfile(targetPeer);
        }
      }
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
