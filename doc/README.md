# Project Aura: Reclaiming Connection

**Aura** is a decentralized, local-first networking utility built to fight the loneliness pandemic by empowering people to connect directly, securely, and privately in the physical world.

---

## Why Aura? (The Social Mission)

Aura is a response to a fundamental crisis of our time:

- **Fighting the Loneliness Pandemic**: We use technology to break the digital barrier and facilitate real-world, face-to-face interactions.
- **Reclaiming the Hold from Big Tech**: Taking the power of connection back from centralized algorithms and putting it into the hands of the people.
- **Removing Conflicts of Interest**: Traditional dating apps want you to stay on the app. Aura is a tool to get you *off* your phone and *into* a conversation.
- **Data Sovereignty**: Built on a secure, local-mesh network where your data remains yours, on your device, always.

For a deeper dive into our philosophy, read the [Aura Manifesto](./MANIFESTO.md).

---

## Core Architectural Pillars

### 1. Local-First Data Sovereignty (Rust + SQLCipher)
Unlike traditional platforms, Aura does not utilize a central database. 
- **Encrypted Storage**: All personal data lives in an encrypted **SQLCipher** database managed directly by the native Rust backend process (`src/core`).
- **On-Device Processing**: Preference learning and profile ranking are handled locally via a Rust-based engine. Your "type" and behavioral patterns never leave your hardware.

### 2. Decentralized Discovery & Mesh Networking
The app replaces the central "matchmaking" server with a P2P discovery layer.
- **Background Proximity**: The Rust backend continuously scans for nearby BLE "Resonances" using **libp2p**, even when the UI is suspended.
- **Security-Conscious Networking**: Connections are established directly between devices (P2P) using secure, authenticated protocols.

### 3. Advanced Reputation & Trust (The "Aura" System)
Aura uses a decentralized reputation mesh to ensure safety and authenticity.
- **Relational Valence**: Your "Aura Score" is not a global number. It is calculated locally based on the specific gossip your device has received, making reputation a subjective, relational perception.
- **Confidence Metrics**: All scores are presented with a confidence percentage, indicating the density of unique peer verifications.

### 4. High-Performance Hybrid UI
Aura utilizes **Tauri v2** combined with a **Vite + React** frontend.
- **Premium Aesthetics**: The UI is constructed with standard HTML/Vanilla CSS, leveraging glassmorphism and modern web animations.
- **Atomic IPC**: The React frontend communicates with the secure Rust backend via Tauri's high-speed IPC bridge.

---

## Technical Summary

| Feature | Implementation |
| --- | --- |
| **Frontend UI** | React (Vite), Vanilla CSS, Lucide Icons |
| **Backend Core** | Rust (Tauri v2, libp2p) |
| **Database** | `rusqlite` + `bundled-sqlcipher` |
| **Networking** | P2P Mesh / Gossipsub / mDNS |
| **Licensing** | AGPL v3 |

---

## Building Aura

Aura uses a standard Unix-style `Makefile` to simplify cross-platform building.

### Prerequisites
- [Rust Toolchain](https://rustup.rs/) (cargo, rustc)
- [Node.js](https://nodejs.org/) & npm
- Android NDK & SDK (for mobile builds)

### Development Commands

Start the full Desktop native app (Rust + UI):
```bash
make run
```

Build the local Android APK development client:
```bash
make build-local
```

Deploy to all connected Android devices:
```bash
make deploy
```

---

## License
Licensed under the **GNU Affero General Public License v3 (AGPL v3)**. See [LICENSE.txt](./LICENSE.txt) for details.
