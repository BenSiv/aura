import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [settings, setSettings] = useState<[string, string][]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const loadedSettings = await invoke<[string, string][]>("get_settings");
        setSettings(loadedSettings);
      } catch (err: any) {
        setError(err.toString());
      }
    }
    loadSettings();
  }, []);

  return (
    <main className="container">
      <h1>Aura Dashboard</h1>
      <p>Local-First Decentralized Dating Utility</p>

      <div className="card">
        <h2>Encrypted Settings (via SQLite)</h2>
        {error && <p className="error">{error}</p>}
        {settings.length === 0 && !error && <p>Loading settings...</p>}
        <ul>
          {settings.map(([key, value]) => (
            <li key={key}>
              <strong>{key}</strong>: {value}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Mesh Network Status</h2>
        <p>Awaiting background proximity events...</p>
        <button onClick={() => alert("Simulation started via Rust IPC!")}>
          Simulate Encounter
        </button>
      </div>
    </main>
  );
}

export default App;
