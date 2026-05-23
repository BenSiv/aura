import { useState, useEffect, useCallback, useRef } from "react";
import { listen, invoke } from "../services/tauri";
import { Profile } from "../components/SwipeCard";
import { DEMO_CONFIG } from "../demo/demoConfig";
import { DEMO_PROFILES } from "../demo/demoData";

export type VisibilityMode = "cloaked" | "resonant" | "public";

const calculateAge = (dobString?: string): number | null => {
  if (!dobString) return null;
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export function useResonance() {
  const [activeAura, setActiveAura] = useState(true);
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>("resonant");
  const [pendingDiscoveries, setPendingDiscoveries] = useState<Profile[]>([]);
  const [localProfile, setLocalProfile] = useState<{ id: string, name: string, bio: string, images: string, tags: string, gender: string, interestedIn: string, dob: string } | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(!DEMO_CONFIG.IS_DEMO_MODE);
  const myLikesRef = useRef<string[]>([]);
  const seenProfilesRef = useRef<Record<string, Profile>>({});
  const interactedProfileIdsRef = useRef<Set<string>>(new Set());
  const localProfileRef = useRef<{ id: string, name: string, bio: string, images: string, tags: string, gender: string, interestedIn: string, dob: string } | null>(null);

  // --- ZK Proximity Handshake Cryptographic States & Refs ---
  const localCoordsRef = useRef({ x: 0.0, y: 0.0 });
  const paillierKeysRef = useRef<Record<string, { pubkey: string, privkey: string }>>({});
  const rValuesRef = useRef<Record<string, string>>({});
  const blindedValuesRef = useRef<Record<string, string>>({});

  const [zkThreshold, setZkThreshold] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zk-proximity-threshold");
      if (saved) return parseInt(saved, 10);
    }
    return 100; // 100 meters default
  });

  const updateZkThreshold = useCallback((val: number) => {
    setZkThreshold(val);
    localStorage.setItem("zk-proximity-threshold", val.toString());
  }, []);

  // --- Safety & Comfort states ---
  const [stealthScan, setStealthScan] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("stealth-scan");
      return saved === "true";
    }
    return false;
  });

  const toggleStealthScan = useCallback(() => {
    setStealthScan(prev => {
      const next = !prev;
      localStorage.setItem("stealth-scan", String(next));
      return next;
    });
  }, []);

  const [minAge, setMinAge] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("min-age");
      if (saved) return parseInt(saved, 10);
    }
    return 18;
  });

  const updateMinAge = useCallback((val: number) => {
    setMinAge(val);
    localStorage.setItem("min-age", val.toString());
  }, []);

  const [maxAge, setMaxAge] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("max-age");
      if (saved) return parseInt(saved, 10);
    }
    return 99;
  });

  const updateMaxAge = useCallback((val: number) => {
    setMaxAge(val);
    localStorage.setItem("max-age", val.toString());
  }, []);

  // --- Email Bridge config states ---
  const [emailAddress, setEmailAddress] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("email-address") || "";
    }
    return "";
  });

  const updateEmailAddress = useCallback((val: string) => {
    setEmailAddress(val);
    localStorage.setItem("email-address", val);
  }, []);

  const [emailPassword, setEmailPassword] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("email-password") || "";
    }
    return "";
  });

  const updateEmailPassword = useCallback((val: string) => {
    setEmailPassword(val);
    localStorage.setItem("email-password", val);
  }, []);

  const [imapServer, setImapServer] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("imap-server") || "";
    }
    return "";
  });

  const updateImapServer = useCallback((val: string) => {
    setImapServer(val);
    localStorage.setItem("imap-server", val);
  }, []);

  const [smtpServer, setSmtpServer] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("smtp-server") || "";
    }
    return "";
  });

  const updateSmtpServer = useCallback((val: string) => {
    setSmtpServer(val);
    localStorage.setItem("smtp-server", val);
  }, []);

  // Retrieve flat offset meter coordinates on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          // Flatten GPS spherical coordinates to planar meters
          const x = lon * 111000 * Math.cos(lat * Math.PI / 180.0);
          const y = lat * 111000;
          localCoordsRef.current = { x, y };
          console.log("[ZKP] Geolocation acquired flat meters:", localCoordsRef.current);
        },
        () => {
          console.warn("[ZKP] Geolocation denied/unavailable. Falling back to coordinates (0, 0)");
        }
      );
    }
  }, []);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aura-theme");
      if (saved === "light" || saved === "dark") return saved;
      return "dark";
    }
    return "dark";
  });

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("aura-theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, [theme]);

  // Synchronize theme on load
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, [theme]);

  // Initialize likes and interacted profile exclusions from DB
  useEffect(() => {
    invoke<any[]>("get_interaction_history").then(history => {
      const likes = history.filter(h => h[1] === "like").map(h => h[0]);
      myLikesRef.current = likes;
      
      const interacted = new Set<string>();
      history.forEach(h => {
        interacted.add(h[0]); // h[0] is the profileId
      });
      interactedProfileIdsRef.current = interacted;
    }).catch(err => console.error("Failed to load interactions:", err));
  }, []);

  // Reactive background broadcasting effect reacting to activeAura, localProfile, and stealthScan
  useEffect(() => {
    if (!localProfile || !activeAura || stealthScan) {
      console.log("[Broadcasting] Passive Stealth Mode Active or Cloaked. No broadcasting.");
      if ((window as any).broadcastInterval) {
        clearInterval((window as any).broadcastInterval);
      }
      return;
    }

    const broadcast = () => {
      const payload = {
        ...localProfile,
        interested_in: localProfile.interestedIn,
        nonce: Math.random().toString() // Bypass Gossipsub duplicate message cache
      };
      invoke("start_broadcasting", { profile: payload }).catch(err => 
        console.error("Failed to start broadcasting:", err)
      );
    };

    broadcast();

    if ((window as any).broadcastInterval) {
      clearInterval((window as any).broadcastInterval);
    }

    (window as any).broadcastInterval = setInterval(broadcast, 10000);

    return () => {
      if ((window as any).broadcastInterval) {
        clearInterval((window as any).broadcastInterval);
      }
    };
  }, [localProfile, activeAura, stealthScan]);

  // ZKP Challenge initiation (Peer B/Verifier)
  const initiateZkChallenge = useCallback(async (peerId: string) => {
    try {
      console.log(`[ZKP] Initiating verification query to Peer: ${peerId}`);
      
      const [pubkey, privkey] = await invoke<[string, string]>("generate_paillier_keypair");
      paillierKeysRef.current[peerId] = { pubkey, privkey };
      
      const [cx, cy, c_sq] = await invoke<[string, string, string]>("encrypt_location", {
        x: localCoordsRef.current.x,
        y: localCoordsRef.current.y,
        pubkeyHex: pubkey
      });
      
      const challengePayload = JSON.stringify({
        enc_x: cx,
        enc_y: cy,
        enc_sq: c_sq,
        pubkey_hex: pubkey
      });
      
      if (localProfileRef.current) {
        await invoke("broadcast_zk_packet", {
          senderId: localProfileRef.current.id,
          receiverId: peerId,
          msgType: "zk_challenge",
          text: challengePayload
        });
        console.log(`[ZKP] Round 1 Challenge packet broadcasted targeting Peer: ${peerId}`);
      }
    } catch (err) {
      console.error("[ZKP] Handshake initialization failed:", err);
      setPendingDiscoveries(prev => 
        prev.map(p => p.id === peerId ? { ...p, zkStatus: "failed", distanceLabel: "Remote / Spoofed Peer" } : p)
      );
    }
  }, []);

  useEffect(() => {
    if (DEMO_CONFIG.FORCE_RESET_ON_LAUNCH) {
      setLocalProfile(null);
      setIsInitialLoading(false);
      return;
    }

    // Standard Core Logic (Non-demo)
    invoke<any>("get_local_profile")
      .then((profile) => {
        if (profile) {
          const normalized = {
            id: profile.id,
            name: profile.name,
            bio: profile.bio,
            images: profile.images || "[]",
            tags: profile.tags || "",
            gender: profile.gender || "Other",
            interestedIn: profile.interested_in || "Both",
            dob: profile.dob || ""
          };
          setLocalProfile(normalized);
          localProfileRef.current = normalized;
        }
        setIsInitialLoading(false);
      });

    // Listen for background mesh proximity events
    const unlisten = listen<any>('resonance_detected', (event) => {
      const { score, peer_data } = event.payload;
      
      if (peer_data) {
        // Exclude profiles we have already interacted with (liked, passed, or blocked)
        if (interactedProfileIdsRef.current.has(peer_data.id)) return;
        
        // Bilateral Age Matching Filter check
        if (peer_data.dob) {
          const peerAge = calculateAge(peer_data.dob);
          if (peerAge !== null) {
            if (peerAge < minAge || peerAge > maxAge) {
              console.log(`[AgeFilter] Silently dropping peer ${peer_data.name} (age ${peerAge}) because they do not fit the bilateral criteria [${minAge}, ${maxAge}]`);
              return;
            }
          }
        }
        
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
            distance: Math.round(score * 10) / 10,
            zkStatus: "verifying",
            distanceLabel: "Verifying ZK Proximity..."
          };

          if (!DEMO_CONFIG.IS_DEMO_MODE) {
            invoke("save_peer_profile", { profile: newPeer }).catch(err => console.error("Failed to save peer:", err));
            // Trigger interactive ZK verification challenge immediately
            initiateZkChallenge(newPeer.id);
          } else {
            // Instant mock verified close for demo compatibility
            newPeer.zkStatus = "verified_close";
            newPeer.distanceLabel = `Verified < ${zkThreshold}m`;
          }

          seenProfilesRef.current[newPeer.id] = newPeer;
          return [...prev, newPeer];
        });
      }
    });

    // Listen for confirmed mutual matches from the Rust core
    const unlistenMatch = listen<string>('mutual_match_established', (event) => {
      const sender_id = event.payload;
      console.log("MUTUAL MATCH ESTABLISHED:", sender_id);
      const matched = seenProfilesRef.current[sender_id];
      if (matched) {
        setMatchedProfile(matched);
      } else {
        // Fetch profile from DB if not in current session cache
        invoke<any[]>("get_peer_profiles", { profileIds: [sender_id] }).then(profiles => {
          if (profiles.length > 0) {
            const p = profiles[0];
            const profile: Profile = {
              id: p.id,
              name: p.name,
              bio: p.bio,
              images: p.images || "[]",
              tags: p.tags || "[]",
              gender: p.gender || "Other",
              distance: 0
            };
            setMatchedProfile(profile);
          }
        });
      }
    });

    // Listen for P2P ZK Handshake packets from Gossipsub
    const unlistenZk = listen<any>('zk_proximity_received', async (event) => {
      const chat = event.payload;
      const senderId = chat.sender_id;
      const msgType = chat.msg_type;
      
      if (msgType === "zk_challenge") {
        console.log(`[ZKP] Round 2: Received challenge from Peer: ${senderId}`);
        try {
          const challenge = JSON.parse(chat.text);
          
          const [blindedEnc, r] = await invoke<[string, string]>("compute_homomorphic_distance", {
            encX: challenge.enc_x,
            encY: challenge.enc_y,
            encSq: challenge.enc_sq,
            myX: localCoordsRef.current.x,
            myY: localCoordsRef.current.y,
            pubkeyHex: challenge.pubkey_hex
          });
          
          rValuesRef.current[senderId] = r;
          
          const responsePayload = JSON.stringify({
            blinded_enc: blindedEnc
          });
          
          if (localProfileRef.current) {
            await invoke("broadcast_zk_packet", {
              senderId: localProfileRef.current.id,
              receiverId: senderId,
              msgType: "zk_response",
              text: responsePayload
            });
            console.log(`[ZKP] Round 2: Sent homomorphic response to Peer: ${senderId}`);
          }
        } catch (err) {
          console.error("[ZKP] Homomorphic response failed:", err);
        }
      }
      
      else if (msgType === "zk_response") {
        console.log(`[ZKP] Round 3: Received homomorphic response from Peer: ${senderId}`);
        try {
          const response = JSON.parse(chat.text);
          const keys = paillierKeysRef.current[senderId];
          if (!keys) return;
          
          const blindedDistanceDecrypted = await invoke<string>("decrypt_blinded_distance", {
            blindedEncHex: response.blinded_enc,
            privkeyHex: keys.privkey
          });
          
          blindedValuesRef.current[senderId] = blindedDistanceDecrypted;
          
          const requestPayload = JSON.stringify({
            blinded_val: blindedDistanceDecrypted
          });
          
          if (localProfileRef.current) {
            await invoke("broadcast_zk_packet", {
              senderId: localProfileRef.current.id,
              receiverId: senderId,
              msgType: "zk_proof_request",
              text: requestPayload
            });
            console.log(`[ZKP] Round 3: Broadcasted ZK range proof request to Peer: ${senderId}`);
          }
        } catch (err) {
          console.error("[ZKP] Blinded distance decryption failed:", err);
        }
      }
      
      else if (msgType === "zk_proof_request") {
        console.log(`[ZKP] Round 4: Received proof request from Peer: ${senderId}`);
        try {
          const req = JSON.parse(chat.text);
          const r = rValuesRef.current[senderId];
          if (!r) return;
          
          const [proofBytes, commitmentBytes] = await invoke<[number[], number[]]>("generate_range_proof", {
            blindedDistanceDecrypted: req.blinded_val,
            r,
            maxDistanceMeters: zkThreshold
          });
          
          const proofPayload = JSON.stringify({
            proof_bytes: proofBytes,
            commitment_bytes: commitmentBytes
          });
          
          if (localProfileRef.current) {
            await invoke("broadcast_zk_packet", {
              senderId: localProfileRef.current.id,
              receiverId: senderId,
              msgType: "zk_proof",
              text: proofPayload
            });
            console.log(`[ZKP] Round 4: Broadcasted Bulletproof range proof to Peer: ${senderId}`);
          }
        } catch (err) {
          console.error("[ZKP] Bulletproof range proof generation failed:", err);
        }
      }
      
      else if (msgType === "zk_proof") {
        console.log(`[ZKP] Verification: Received Bulletproof from Peer: ${senderId}`);
        try {
          const proofData = JSON.parse(chat.text);
          const blindedVal = blindedValuesRef.current[senderId];
          const keys = paillierKeysRef.current[senderId];
          if (!blindedVal || !keys) return;
          
          const isValid = await invoke<boolean>("verify_range_proof", {
            proofBytes: proofData.proof_bytes,
            commitmentBytes: proofData.commitment_bytes,
            blindedValDecryptedForVerif: blindedVal,
            r: "1",
            maxDistanceMeters: zkThreshold
          });
          
          console.log(`[ZKP] Cryptographic Bulletproof verification result:`, isValid);
          
          setPendingDiscoveries(prev => 
            prev.map(p => {
              if (p.id === senderId) {
                if (isValid) {
                  return { 
                    ...p, 
                    zkStatus: "verified_close", 
                    distanceLabel: `Verified < ${zkThreshold}m` 
                  };
                } else {
                  return { 
                    ...p, 
                    zkStatus: "failed", 
                    distanceLabel: "Remote / Spoofed Peer" 
                  };
                }
              }
              return p;
            })
          );
        } catch (err) {
          console.error("[ZKP] Bulletproof range proof verification failed:", err);
          setPendingDiscoveries(prev => 
            prev.map(p => p.id === senderId ? { ...p, zkStatus: "failed", distanceLabel: "Remote / Spoofed Peer" } : p)
          );
        }
      }
    });

    return () => {
      unlisten.then(f => f());
      unlistenMatch.then(f => f());
      unlistenZk.then(f => f());
    };
  }, [initiateZkChallenge, zkThreshold, minAge, maxAge]);

  // Periodically poll Email Bridge for incoming out-of-proximity match proposals (Stealth matches)
  useEffect(() => {
    const email = localStorage.getItem("email-address");
    const password = localStorage.getItem("email-password");
    const imap_server = localStorage.getItem("imap-server");
    const smtp_server = localStorage.getItem("smtp-server");

    if (!email || !password || !imap_server) return;

    const pollInterval = setInterval(async () => {
      try {
        const proposalsJson = await invoke<string[]>("poll_email_chat_messages", {
          config: { email, password, imap_server, smtp_server }
        });

        for (const jsonStr of proposalsJson) {
          try {
            const envelope = JSON.parse(jsonStr);
            if (envelope.msg_type === "stealth_match_proposal" && envelope.sender_profile) {
              const sender = envelope.sender_profile;
              
              // 1. Record the discovered peer in local database so it is in our system
              await invoke("save_peer_profile", { profile: {
                id: sender.id,
                name: sender.name,
                bio: sender.bio,
                tags: sender.tags,
                images: sender.images,
                gender: sender.gender,
                interested_in: sender.interestedIn,
                dob: sender.dob
              }});

              // 2. Automatically record their like for us!
              await invoke("record_local_interaction", { profileId: sender.id, interactionType: "like" });

              // 3. Trigger mutual match checks reactively!
              if (myLikesRef.current.includes(sender.id)) {
                setMatchedProfile({
                  id: sender.id,
                  name: sender.name,
                  bio: sender.bio,
                  tags: sender.tags,
                  images: sender.images,
                  gender: sender.gender,
                  distance: 0,
                  zkStatus: "verified_close"
                });
              } else {
                // If we haven't liked them yet, quietly add them to discoveries list so we can see them!
                setPendingDiscoveries(prev => {
                  if (prev.some(p => p.id === sender.id)) return prev;
                  return [...prev, {
                    id: sender.id,
                    name: sender.name,
                    bio: sender.bio,
                    tags: sender.tags,
                    images: sender.images,
                    gender: sender.gender,
                    distance: 9999, // Marked as Remote/Out-of-proximity match
                    distanceLabel: "Remote Discovery",
                    score: 0.95,
                    zkStatus: "verified_close"
                  }];
                });
              }
            }
          } catch (e) {
            console.error("Failed to process stealth match proposal email payload:", e);
          }
        }
      } catch (err) {
        console.warn("[EmailBridge] Background IMAP match polling skipped:", err);
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [localProfile]);

  const cycleVisibility = () => {
    const modes: VisibilityMode[] = ["cloaked", "resonant", "public"];
    setVisibilityMode(modes[(modes.indexOf(visibilityMode) + 1) % modes.length]);
  };

  const handleSaveProfile = async (name: string, bio: string, tags: string, image: string, gender: string, interestedIn: string, dob: string) => {
    const isNewProfile = localProfile === null;

    const newProfile = {
      id: localProfile?.id || crypto.randomUUID(),
      name,
      bio,
      tags,
      images: JSON.stringify([image]),
      gender,
      interestedIn,
      dob
    };

    // Apply safety comfort defaults based on gender for fresh installations
    if (isNewProfile) {
      if (gender === "Woman") {
        setStealthScan(true);
        localStorage.setItem("stealth-scan", "true");
        setVisibilityMode("cloaked");
      } else {
        setStealthScan(false);
        localStorage.setItem("stealth-scan", "false");
        setVisibilityMode("resonant");
      }
    }

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
      const payload = {
        id: newProfile.id,
        name: newProfile.name,
        bio: newProfile.bio,
        tags: newProfile.tags,
        images: newProfile.images,
        gender: newProfile.gender,
        interested_in: newProfile.interestedIn,
        dob: newProfile.dob
      };
      await invoke("save_local_profile", { profile: payload });
      setLocalProfile(newProfile as any);
      localProfileRef.current = newProfile as any;
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const handleInteraction = (type: 'like' | 'pass') => {
    if (pendingDiscoveries.length > 0) {
      const targetPeer = pendingDiscoveries[0];
      
      // Mark as interacted immediately to exclude it from future discoveries
      interactedProfileIdsRef.current.add(targetPeer.id);
      
      if (!DEMO_CONFIG.IS_DEMO_MODE) {
        invoke("record_local_interaction", { profileId: targetPeer.id, interactionType: type }).catch(err => console.error("Failed to record interaction:", err));
        if (type === 'like') {
          myLikesRef.current = [...myLikesRef.current, targetPeer.id];
          
          // Check if they already liked us (double-blind mutual check!)
          invoke<boolean>("check_mutual_match", { profileId: targetPeer.id }).then(isMatch => {
            if (isMatch) {
              setMatchedProfile(targetPeer);
            }
          });

          // Transmit out-of-proximity match proposal via Email Bridge (Mitigation 6 & Section 5.1)
          const email = localStorage.getItem("email-address");
          const password = localStorage.getItem("email-password");
          const imap_server = localStorage.getItem("imap-server");
          const smtp_server = localStorage.getItem("smtp-server");
          
          if (email && password && smtp_server && localProfile) {
            const peerEmail = `${targetPeer.name.toLowerCase().replace(/\s+/g, "")}@auramail.net`;
            const handshakeEnvelope = {
              msg_type: "stealth_match_proposal",
              id: `match_${localProfile.id}_${Date.now()}`,
              sender_profile: localProfile,
              timestamp: Math.floor(Date.now() / 1000)
            };
            invoke("send_email_chat_message", {
              config: { email, password, imap_server, smtp_server },
              toEmail: peerEmail,
              messageJson: JSON.stringify(handshakeEnvelope)
            }).catch(err => console.warn("[EmailBridge] Match proposal skipped:", err));
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
    setMatchedProfile,
    theme,
    toggleTheme,
    zkThreshold,
    updateZkThreshold,
    stealthScan,
    toggleStealthScan,
    minAge,
    updateMinAge,
    maxAge,
    updateMaxAge,
    emailAddress,
    updateEmailAddress,
    emailPassword,
    updateEmailPassword,
    imapServer,
    updateImapServer,
    smtpServer,
    updateSmtpServer
  };
}
