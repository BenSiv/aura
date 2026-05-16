import { useState, useEffect, useCallback } from "react";
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { Profile } from "../components/SwipeCard";

export type VisibilityMode = "cloaked" | "resonant" | "public";

export function useResonance() {
  const [activeAura, setActiveAura] = useState(true);
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>("resonant");
  const [pendingDiscoveries, setPendingDiscoveries] = useState<Profile[]>([]);
  const [localProfile, setLocalProfile] = useState<{ id: string, name: string, bio: string, images: string, tags: string, gender: string, interestedIn: string } | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false); // Skip loading for demo

  const startBroadcasting = useCallback((profile: any) => {
    // Shout our presence every 10 seconds
    invoke("start_broadcasting", { profile });
    const interval = setInterval(() => {
      invoke("start_broadcasting", { profile });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Persistence disabled for demo branch
    setIsInitialLoading(false);

    // Listen for background mesh proximity events
    const unlisten = listen<any>('resonance_detected', (event) => {
      const { profile_id, score, peer_data } = event.payload;
      
      if (peer_data) {
        setPendingDiscoveries(prev => {
          if (prev.some(p => p.id === peer_data.id)) return prev;
          return [...prev, {
            id: peer_data.id,
            name: peer_data.name,
            bio: peer_data.bio,
            images: peer_data.images,
            tags: peer_data.tags,
            distance: Math.round(score * 10) / 10
          }];
        });
        return;
      }

      const simulatedProfiles: Record<string, Partial<Profile>> = {
        "simulated_user_alex": {
          name: "Alex Rivera",
          bio: "Building the future of decentralized networks. Passionate about mesh technology and sustainable energy.",
          images: JSON.stringify(["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80"]),
          tags: JSON.stringify(["coding", "mesh", "solarpunk"]),
        },
        "simulated_user_jamie": {
          name: "Jamie Chen",
          bio: "Digital artist and coffee enthusiast. I love exploring the intersection of technology and human connection.",
          images: JSON.stringify(["https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"]),
          tags: JSON.stringify(["art", "coffee", "ui/ux"]),
        },
        "simulated_user_sam": {
          name: "Sam Wilson",
          bio: "Adventure seeker and photographer. Usually found in the mountains or at a concert.",
          images: JSON.stringify(["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"]),
          tags: JSON.stringify(["hiking", "photo", "music"]),
        }
      };

      const baseProfile = simulatedProfiles[profile_id] || {
        name: "Unknown Resonance",
        bio: "An unidentified energy signature has been detected.",
        images: JSON.stringify(["https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80"]),
        tags: "[]",
      };

      setPendingDiscoveries(prev => [...prev, {
        id: profile_id,
        name: baseProfile.name!,
        bio: baseProfile.bio!,
        images: baseProfile.images!,
        tags: baseProfile.tags!,
        distance: Math.round(score * 10) / 10
      }]);
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
      interestedIn
    };
    // No DB save for demo
    setLocalProfile(newProfile as any);
  };

  const handleInteraction = (type: 'like' | 'pass') => {
    if (type === 'like' && pendingDiscoveries.length > 0) {
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
