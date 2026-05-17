import React from "react";
import { ArrowLeft, Shield, Bell, Zap, Database, Lock } from "lucide-react";

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  return (
    <div className="app-container" style={{ padding: '20px' }}>
      <header className="header" style={{ marginBottom: '20px' }}>
        <button className="icon-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="brand">Aura Settings</div>
        <div style={{ width: 40 }} />
      </header>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <button className="btn-primary" style={{ width: '100%', background: 'var(--accent-danger)' }}>
            Wipe Local Data & Reset ID
          </button>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Aura ID: {crypto.randomUUID().split('-')[0]}...
          </p>
        </div>
      </div>

      <style>{`
        .settings-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 0.5rem;
          border: 1px solid var(--glass-border);
        }
        .settings-item-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .settings-item-info h4 {
          font-size: 0.9375rem;
          margin: 0;
        }
        .settings-item-info p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
        }
        .status-badge {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--accent-success);
          background: rgba(16, 185, 129, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};
