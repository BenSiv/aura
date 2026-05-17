import React from "react";
import { ArrowLeft, Shield, Bell, Zap, Database, Lock, Sun, Moon } from "lucide-react";

interface SettingsScreenProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ theme, onToggleTheme, onBack }) => {
  return (
    <div className="app-container" style={{ padding: '20px' }}>
      <header className="header" style={{ marginBottom: '20px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn-icon" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="brand" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Aura Settings</div>
        <div style={{ width: 44 }} />
      </header>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="detail-section">
          <h3>Appearance</h3>
          <div className="settings-item">
            <div className="settings-item-info">
              {theme === "light" ? <Sun size={20} style={{ color: 'var(--accent-primary)' }} /> : <Moon size={20} style={{ color: 'var(--accent-primary)' }} />}
              <div>
                <h4>Light Theme</h4>
                <p>Enjoy a bright, clean, high-contrast visual design.</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={theme === "light"} onChange={onToggleTheme} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="detail-section">
          <h3>Privacy & Security</h3>
          <div className="settings-item">
            <div className="settings-item-info">
              <Lock size={20} />
              <div>
                <h4>End-to-End Encryption</h4>
                <p>All mesh messages are secured with local keys.</p>
              </div>
            </div>
            <div className="status-badge">Active</div>
          </div>
          <div className="settings-item">
            <div className="settings-item-info">
              <Shield size={20} />
              <div>
                <h4>Identity Rotation</h4>
                <p>Rotate your ephemeral ID every hour.</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="detail-section">
          <h3>Mesh Configuration</h3>
          <div className="settings-item">
            <div className="settings-item-info">
              <Zap size={20} />
              <div>
                <h4>High Performance Mode</h4>
                <p>Increase mesh polling frequency (uses more battery).</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
          <div className="settings-item">
            <div className="settings-item-info">
              <Database size={20} />
              <div>
                <h4>Local Storage Only</h4>
                <p>Ensure no data ever leaves the local device.</p>
              </div>
            </div>
            <div className="status-badge">Always On</div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Notifications</h3>
          <div className="settings-item">
            <div className="settings-item-info">
              <Bell size={20} />
              <div>
                <h4>Resonance Alerts</h4>
                <p>Notify when a high-compatibility aura is nearby.</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: '2rem 0', textAlign: 'center' }}>
          <button className="btn-primary" style={{ width: '100%', background: 'var(--accent-danger)', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.4)' }}>
            Wipe Local Data & Reset ID
          </button>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Aura ID: {crypto.randomUUID().split('-')[0]}...
          </p>
        </div>
      </div>
    </div>
  );
};
