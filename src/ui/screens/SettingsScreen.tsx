import React from "react";
import { ArrowLeft, Shield, Bell, Zap, Database, Lock, Sun, Moon, EyeOff, Sliders, Mail } from "lucide-react";
import { InfoTip } from "../components/InfoTip";

interface SettingsScreenProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onBack: () => void;
  zkThreshold: number;
  onUpdateZkThreshold: (val: number) => void;
  
  // Asymmetric Stealth Mode
  stealthScan: boolean;
  onToggleStealthScan: () => void;
  
  // Bilateral Age Filtering
  minAge: number;
  onUpdateMinAge: (val: number) => void;
  maxAge: number;
  onUpdateMaxAge: (val: number) => void;
  
  // Email Chat Bridge
  emailAddress: string;
  onUpdateEmailAddress: (val: string) => void;
  emailPassword: string;
  onUpdateEmailPassword: (val: string) => void;
  imapServer: string;
  onUpdateImapServer: (val: string) => void;
  smtpServer: string;
  onUpdateSmtpServer: (val: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  theme,
  onToggleTheme,
  onBack,
  zkThreshold,
  onUpdateZkThreshold,
  stealthScan,
  onToggleStealthScan,
  minAge,
  onUpdateMinAge,
  maxAge,
  onUpdateMaxAge,
  emailAddress,
  onUpdateEmailAddress,
  emailPassword,
  onUpdateEmailPassword,
  imapServer,
  onUpdateImapServer,
  smtpServer,
  onUpdateSmtpServer,
}) => {
  return (
    <div className="app-container" style={{ padding: "20px" }}>
      <header
        className="header"
        style={{
          marginBottom: "20px",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button className="btn-icon" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="brand" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
          Aura Settings
        </div>
        <div style={{ width: 44 }} />
      </header>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* ── Appearance ───────────────────────────────────────────────── */}
        <div className="detail-section">
          <h3>Appearance</h3>
          <div className="settings-item">
            <div className="settings-item-info">
              {theme === "light" ? (
                <Sun size={20} style={{ color: "var(--accent-primary)" }} />
              ) : (
                <Moon size={20} style={{ color: "var(--accent-primary)" }} />
              )}
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Light Theme
                  <InfoTip
                    title="Light Theme"
                    body="Switches the entire UI to a high-contrast white palette. Recommended for use in bright outdoor environments. Your preference is saved locally on this device."
                  />
                </h4>
                <p>Enjoy a bright, clean, high-contrast visual design.</p>
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === "light"}
                onChange={onToggleTheme}
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* ── Safety & Comfort (New!) ─────────────────────────────────── */}
        <div className="detail-section">
          <h3>Safety &amp; Comfort</h3>

          {/* Stealth Mode Switch */}
          <div className="settings-item">
            <div className="settings-item-info">
              <EyeOff size={20} style={{ color: "var(--accent-primary)" }} />
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Asymmetric Stealth Scan
                  <InfoTip
                    title="Asymmetric Stealth Scan (Ghost Mode)"
                    body="Conceal your presence while discovering nearby aura fields. When active, you do not advertise/broadcast your profile, but you can still passively listen and scan for other active users."
                    rows={[
                      ["Advantage:", "Absolute comfort walking in public without revealing your presence."],
                      ["How to match:", "Your identity is only revealed to a peer when you actively swipe 'Like' on them."],
                    ]}
                  />
                </h4>
                <p>Conceal your presence while scanning nearby aura fields.</p>
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={stealthScan}
                onChange={onToggleStealthScan}
              />
              <span className="slider" />
            </label>
          </div>

          {/* Age Filters */}
          <div
            className="settings-item"
            style={{
              flexDirection: "column",
              alignItems: "stretch",
              gap: "0.75rem",
            }}
          >
            <div className="settings-item-info">
              <Sliders size={20} style={{ color: "var(--accent-primary)" }} />
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Bilateral Age Filters
                  <InfoTip
                    title="Bilateral Age Match Filters"
                    body="Set your target age limits. AuraRadar enforces these parameters on both ends of the mesh before completing handshakes or alerting either party."
                    rows={[
                      ["Zero-Knowledge:", "Enforced cryptographically using Bulletproof range proofs. Your exact date of birth is never transmitted."],
                      ["Mutual gatekeeping:", "If either user falls outside the other's preferred age bracket, the discovery is silently dropped."],
                    ]}
                  />
                </h4>
                <p>Restrict encounters to preferred age brackets (both ways).</p>
              </div>
            </div>

            {/* Dual Age range readout */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem", fontWeight: 600 }}>
              <span style={{ color: "var(--text-secondary)" }}>Target Age Range:</span>
              <span style={{ color: "var(--accent-primary)", fontSize: "1rem" }}>{minAge} – {maxAge} years</span>
            </div>

            {/* Premium Dual Slider Track and Handles */}
            <div style={{ position: "relative", width: "100%", height: "24px", marginTop: "4px" }}>
              {/* Underlying visual track */}
              <div style={{
                position: "absolute",
                top: "9px",
                left: 0,
                right: 0,
                height: "6px",
                borderRadius: "3px",
                background: "rgba(255, 255, 255, 0.1)"
              }} />
              
              {/* Active illuminated range bar */}
              <div style={{
                position: "absolute",
                top: "9px",
                left: `${((minAge - 18) / (99 - 18)) * 100}%`,
                width: `${((maxAge - minAge) / (99 - 18)) * 100}%`,
                height: "6px",
                borderRadius: "3px",
                background: "var(--accent-primary)",
                boxShadow: "0 0 10px rgba(99, 102, 241, 0.4)"
              }} />
              
              {/* Min Age Handle */}
              <input
                type="range"
                min="18"
                max="99"
                value={minAge}
                onChange={(e) => {
                  const val = Math.min(parseInt(e.target.value, 10), maxAge - 1);
                  onUpdateMinAge(val);
                }}
                style={{
                  position: "absolute",
                  top: "2px",
                  left: 0,
                  width: "100%",
                  height: "20px",
                  margin: 0,
                  background: "none",
                  pointerEvents: "none",
                  WebkitAppearance: "none",
                  appearance: "none",
                  zIndex: minAge > 58 ? 5 : 3
                }}
                className="dual-range-input"
              />

              {/* Max Age Handle */}
              <input
                type="range"
                min="18"
                max="99"
                value={maxAge}
                onChange={(e) => {
                  const val = Math.max(parseInt(e.target.value, 10), minAge + 1);
                  onUpdateMaxAge(val);
                }}
                style={{
                  position: "absolute",
                  top: "2px",
                  left: 0,
                  width: "100%",
                  height: "20px",
                  margin: 0,
                  background: "none",
                  pointerEvents: "none",
                  WebkitAppearance: "none",
                  appearance: "none",
                  zIndex: minAge > 58 ? 3 : 5
                }}
                className="dual-range-input"
              />
            </div>
            
            {/* Scale boundaries */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              <span>18</span>
              <span>99</span>
            </div>
          </div>
        </div>

        {/* ── Privacy & Security ───────────────────────────────────────── */}
        <div className="detail-section">
          <h3>Privacy &amp; Security</h3>

          {/* ZK Proximity Circle */}
          <div
            className="settings-item"
            style={{
              flexDirection: "column",
              alignItems: "stretch",
              gap: "0.75rem",
            }}
          >
            <div className="settings-item-info">
              <Shield size={20} style={{ color: "var(--accent-primary)" }} />
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  ZK Proximity Circle
                  <InfoTip
                    title="Zero-Knowledge Proximity Range"
                    body="This radius defines the maximum distance (in meters) at which another Aura user can be verified as physically nearby — without ever revealing your exact GPS coordinates to them or to any server."
                    rows={[
                      ["How it works:", "Your coordinates are encrypted with Paillier homomorphic encryption. The peer computes the squared distance on the ciphertext and sends back a blinded value. You decrypt and check it with a Bulletproof ZK range proof."],
                      ["Tighter range (10–50 m):", "Higher certainty they are truly close by. Harder to spoof. Fewer matches in sparse areas."],
                      ["Wider range (200–500 m):", "More potential matches in the same neighbourhood, but slightly easier for a remote attacker to fake proximity using a relay."],
                      ["Cannot be triangulated:", "Because each proof uses a one-time random blinding scalar r, no third party can deduce your location from intercepted proofs."],
                    ]}
                  />
                </h4>
                <p>Adjust the secure proximity threshold for distance matching.</p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  Threshold Radius:
                </span>
                <span style={{ color: "var(--accent-primary)" }}>
                  {zkThreshold} meters
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={zkThreshold}
                onChange={(e) =>
                  onUpdateZkThreshold(parseInt(e.target.value, 10))
                }
                className="range-slider"
                style={{
                  width: "100%",
                  accentColor: "var(--accent-primary)",
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.7rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span>10 m (Ultra Safe)</span>
                <span>500 m (Wide Area)</span>
              </div>
            </div>
          </div>

          {/* End-to-End Encryption */}
          <div className="settings-item">
            <div className="settings-item-info">
              <Lock size={20} />
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  End-to-End Encryption
                  <InfoTip
                    title="End-to-End Mesh Encryption"
                    body="Every message sent over the Aura P2P mesh is encrypted with keys that only exist on the two devices involved. No relay node, server, or middleman holds a copy of your private key."
                    rows={[
                      ["Protocol:", "Noise protocol framework (XX handshake) via libp2p-noise."],
                      ["Key storage:", "Private keys are stored only in your device's local SQLite database and never transmitted."],
                      ["Forward secrecy:", "Session keys are ephemeral; compromising one session cannot decrypt past or future sessions."],
                    ]}
                  />
                </h4>
                <p>All mesh messages are secured with local keys.</p>
              </div>
            </div>
            <div className="status-badge">Active</div>
          </div>

          {/* Identity Rotation */}
          <div className="settings-item">
            <div className="settings-item-info">
              <Shield size={20} />
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Identity Rotation
                  <InfoTip
                    title="Ephemeral Identity Rotation"
                    body="Aura automatically regenerates your peer ID (the public identifier broadcast over the mesh) on a rolling schedule. This prevents passive observers from tracking your movements over time."
                    rows={[
                      ["When enabled:", "Your peer ID changes every hour, breaking long-term correlation."],
                      ["When disabled:", "Your peer ID stays fixed for the session. Useful for debugging, but reduces anonymity."],
                      ["Note:", "Your profile data (name, bio, images) remains the same — only the low-level network identifier rotates."],
                    ]}
                  />
                </h4>
                <p>Rotate your ephemeral ID every hour.</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* ── Communication Bridge (New!) ─────────────────────────────── */}
        <div className="detail-section">
          <h3>Communication Bridge</h3>
          
          <div
            className="settings-item"
            style={{
              flexDirection: "column",
              alignItems: "stretch",
              gap: "0.75rem",
            }}
          >
            <div className="settings-item-info">
              <Mail size={20} style={{ color: "var(--accent-primary)" }} />
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Persistent Long-Range Email Chat
                  <InfoTip
                    title="Persistent Email P2P Chat Bridge"
                    body="Exchange encryption keys over the short-range mesh, then bridge the conversation securely over federated SMTP/IMAP (email) once out of physical mesh range."
                    rows={[
                      ["Delta Chat model:", "Leverages standard existing email networks to route P2P encrypted chat bubbles, avoiding centralized chat servers."],
                      ["Privacy:", "Autocrypt headers ensure messages are PGP/ECC encrypted. Stored only in local SQLite DB."],
                      ["Setup:", "Provide your IMAP/SMTP details. Verified on-device only."],
                    ]}
                  />
                </h4>
                <p>Sync mesh chats with persistent SMTP/IMAP email channels.</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Aura Email Address</span>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={emailAddress}
                  onChange={(e) => onUpdateEmailAddress(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Bridge Password / App Password</span>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={emailPassword}
                  onChange={(e) => onUpdateEmailPassword(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>IMAP Server</span>
                  <input
                    type="text"
                    placeholder="imap.example.com"
                    value={imapServer}
                    onChange={(e) => onUpdateImapServer(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>SMTP Server</span>
                  <input
                    type="text"
                    placeholder="smtp.example.com"
                    value={smtpServer}
                    onChange={(e) => onUpdateSmtpServer(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mesh Configuration ───────────────────────────────────────── */}
        <div className="detail-section">
          <h3>Mesh Configuration</h3>
          <div className="settings-item">
            <div className="settings-item-info">
              <Zap size={20} />
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  High Performance Mode
                  <InfoTip
                    title="High Performance Mesh Mode"
                    body="Increases the frequency of mDNS discovery broadcasts and Gossipsub heartbeats, allowing you to discover nearby peers faster. This comes at the cost of higher CPU and battery usage."
                    rows={[
                      ["Standard mode:", "Discovery broadcast every 10 s. Battery friendly."],
                      ["High perf mode:", "Discovery broadcast every 2–3 s. Finds peers ~5× faster."],
                      ["Best for:", "Short sessions in crowded events or when actively looking for matches."],
                    ]}
                  />
                </h4>
                <p>Increase mesh polling frequency (uses more battery).</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider" />
            </label>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <Database size={20} />
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Local Storage Only
                  <InfoTip
                    title="Local-First Storage Guarantee"
                    body="Aura is architected so that all profile data, match history, and messages are stored exclusively in a SQLite database on your device. There is no cloud backend, no account server, and no sync service."
                    rows={[
                      ["Profiles:", "Stored in /data/aura.db on device only."],
                      ["Messages:", "Delivered P2P over the mesh — never routed through a server."],
                      ["What leaves your device:", "Only the encrypted Gossipsub broadcast packets that peers in your immediate mesh vicinity can receive."],
                    ]}
                  />
                </h4>
                <p>Ensure no data ever leaves the local device.</p>
              </div>
            </div>
            <div className="status-badge">Always On</div>
          </div>
        </div>

        {/* ── Notifications ─────────────────────────────────────────────── */}
        <div className="detail-section">
          <h3>Notifications</h3>
          <div className="settings-item">
            <div className="settings-item-info">
              <Bell size={20} />
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Resonance Alerts
                  <InfoTip
                    title="Resonance Proximity Alerts"
                    body="When a nearby peer's mesh broadcast is detected and their compatibility score meets your threshold, you will receive a local device notification even if Aura is in the background."
                    rows={[
                      ["Trigger:", "Peer detected within ZK proximity circle AND compatibility score ≥ 70%."],
                      ["Privacy:", "The alert is generated entirely on-device. No push notification server is involved."],
                    ]}
                  />
                </h4>
                <p>Notify when a high-compatibility aura is nearby.</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* ── Danger zone ──────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: "auto",
            padding: "2rem 0",
            textAlign: "center",
          }}
        >
          <button
            className="btn-primary"
            style={{
              width: "100%",
              background: "var(--accent-danger)",
              boxShadow: "0 4px 14px rgba(244, 63, 94, 0.4)",
            }}
          >
            Wipe Local Data &amp; Reset ID
          </button>
          <p
            style={{
              fontSize: "10px",
              color: "var(--text-secondary)",
              marginTop: "1rem",
            }}
          >
            Aura ID: {crypto.randomUUID().split("-")[0]}...
          </p>
        </div>
      </div>
    </div>
  );
};

