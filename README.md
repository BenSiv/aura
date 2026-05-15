# Project Aura: A Local-First, Decentralized Dating Utility

**Aura** is a dating application built on the principle that digital connection should be a private utility rather than a centralized, data-mining business. By shifting from a traditional client-server model to a **decentralized, peer-to-peer (P2P)** architecture, Aura aligns the software's success with the user’s goal: finding a partner and maintaining data sovereignty.

---

## Core Architectural Pillars

### 1. Local-First Data Sovereignty (Rust + SQLCipher)
Unlike traditional platforms, Aura does not utilize a central database. 
* **Encrypted Storage:** All personal data lives in an encrypted **SQLCipher** database managed directly by the native Rust backend process (`src-tauri`).
* **On-Device Processing:** Preference learning and profile ranking are handled locally via a Rust-based ML engine. Your "type" and behavioral patterns never leave your hardware.

### 2. Decentralized Discovery & Mesh Networking
The app replaces the central "matchmaking" server with a P2P discovery layer.
* **Background Proximity:** The Rust backend continuously scans for nearby BLE "Resonances", even when the WebView UI is suspended by the mobile OS.
* **Store-Carry-Forward:** This allows profiles to travel across a geographic region through the physical movement of users, effectively creating a "living" network.

### 3. High-Performance Hybrid UI
Aura utilizes **Tauri v2** combined with a **Vite + React** frontend.
* **Premium Aesthetics:** The UI is constructed with standard HTML/Vanilla CSS, leveraging glassmorphism and modern web animations without the overhead of massive React Native bridges.
* **IPC Bridge:** The React frontend communicates with the secure Rust backend via Tauri's Inter-Process Communication (`invoke`, `listen`).

---

## Technical Summary

| Feature | Implementation |
| --- | --- |
| **Frontend UI** | React (Vite), Vanilla CSS, Lucide Icons |
| **Backend Core** | Rust (Tauri v2) |
| **Database** | `rusqlite` + `bundled-sqlcipher` |
| **Networking** | Rust Mesh / Background Threads |
| **Licensing** | AGPL v3 |

---

## Building Aura

Aura uses a standard Unix-style `Makefile` to simplify cross-platform building.

### Prerequisites
* [Rust Toolchain](https://rustup.rs/) (cargo, rustc)
* [Node.js](https://nodejs.org/) & npm
* Android NDK & SDK (for mobile builds)

### Development Commands

Start the Web-only UI server for rapid prototyping:
```bash
npm run dev
```

Start the full Desktop native app (Rust + UI):
```bash
make run
```

Build the local Android APK development client:
```bash
make build-local
```

### Release Pipeline

To generate a versioned publication of the app:
```bash
make release
```
This will create a git tag, export a static web build, and compile the final Android APK into `pub/v<version>/`.

---

## License
Licensed under the **GNU Affero General Public License v3 (AGPL v3)**. See [LICENSE.txt](./LICENSE.txt) for details.
