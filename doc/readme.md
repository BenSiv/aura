![AuraRadar Banner](./pub/store_assets/feature_graphic.png)

# ✨ AuraRadar ✨

**Reclaiming Connection: A Decentralized, Local-First Proximity Network for Real-World Serendipity**

![Platform Support](https://img.shields.io/badge/Platform-Android%20%7C%20Desktop-brightgreen?style=flat-square&logo=android) ![Core Rust Tauri](https://img.shields.io/badge/Core-Rust%20%7C%20Tauri%20v2-orange?style=flat-square&logo=rust) ![Security](https://img.shields.io/badge/Security-SQLCipher%20%26%20Zero--Knowledge-blueviolet?style=flat-square) ![License AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-red?style=flat-square)

---

## 🎬 Quick Video Demo

Watch the **40-second walkthrough** of the core AuraRadar experience in action:

[![Watch AuraRadar Youtube Video](./pub/auraradar_youtube_demo.webp)](https://www.youtube.com/shorts/aaZ9QfXklVw)

👉 **[Click Here to Watch the YouTube Shorts Demo!](https://www.youtube.com/shorts/aaZ9QfXklVw)** 🎬

---

## 🌟 The Social Mission: Reclaiming Connection

We live in a paradox: we are more digitally connected than ever, yet we are in the midst of a global **loneliness pandemic**. 

**AuraRadar** is a direct response to this crisis. It is a local-first, serverless networking utility built to get you **off your screen** and **into a face-to-face conversation** with the people physically around you.

*   **No Centralized Hold**: Taking the power of connection back from Big Tech's centralized matching algorithms and returning it directly to your local proximity space.
*   **Zero Conflicts of Interest**: Commercial dating and social apps are designed to keep you swiping endlessly on their platform so they can monetize your attention. AuraRadar is built to facilitate immediate real-world introductions and then get out of your way.
*   **Absolute Data Sovereignty**: Your profile data, swipes history, preferences, and private conversations are stored only on your physical device, fully encrypted. Your "type" never leaves your hardware.

*For a deep dive into our philosophy, read the full [AuraRadar Manifesto](./manifesto.md).*

---

## 📱 Live Core Flow Preview

When another user enters your physical proximity, AuraRadar automatically initiates a zero-knowledge proximity handshake and establishes a secure, local peer-to-peer mesh chat thread.

![AuraRadar Core Flow Preview](./pub/auraradar_scan_match_chat.webp)

---

## 📸 Interface & Journey Showcase

Explore the standard **9:16 portrait views** of AuraRadar, showing the high-fidelity glassmorphism interface and interactive features:

| **1. Secure Onboarding** | **2. Proximity Radar** | **3. Swipe Discovery** | **4. Profile Details** |
| :---: | :---: | :---: | :---: |
| ![Onboard securely](./fst/metadata/android/en-US/images/phoneScreenshots/1.png) | ![Scan proximity](./fst/metadata/android/en-US/images/phoneScreenshots/2.png) | ![Encounter cards](./fst/metadata/android/en-US/images/phoneScreenshots/3.png) | ![Profile details](./fst/metadata/android/en-US/images/phoneScreenshots/4.png) |
| *Onboard securely with name and bio* | *Scan proximity space for local resonances* | *Encounter and swipe on nearby active profile cards* | *Inspect profile bio, interests, and distance* |

| **5. Mutual Match** | **6. Encrypted P2P Chat** | **7. Interaction History** | **8. Zero-Knowledge Settings** |
| :---: | :---: | :---: | :---: |
| ![Celebrate match](./fst/metadata/android/en-US/images/phoneScreenshots/5.png) | ![Direct mesh chat](./fst/metadata/android/en-US/images/phoneScreenshots/6.png) | ![Swipes history](./fst/metadata/android/en-US/images/phoneScreenshots/7.png) | ![Settings coordinates](./fst/metadata/android/en-US/images/phoneScreenshots/8.png) |
| *Instant match celebration screen* | *Secure mesh chat thread with live resonance scoring* | *Review history of past matches and encounters* | *Configure privacy and coordinate blinding tooltips* |

---

## 🛠️ Core Architectural Pillars

### 1. Local-First Data Sovereignty (Rust + SQLCipher)
*   **Encrypted Storage**: Personal profile data and interaction history reside in a secure, local **SQLCipher** database managed directly by our native Rust core process (`src/core`).
*   **On-Device Machine Learning**: Profile scoring and preference calculations are performed entirely locally on your device. Your swipe patterns and behavioral footprints never leave your physical hardware.

### 2. Decentralized Discovery & Mesh Networking
*   **No Central Servers**: Proximity discovery replaces standard matchmaking servers with an autonomous P2P swarm.
*   **Persistent Background Scanning**: A native Android Foreground Service (`AuraForegroundService.kt`) runs continuously in the background using specialized `meshNetworkScan` bindings, scanning for BLE/Wi-Fi proximity and firing local notifications even when the app is suspended.
*   **Bypassing Hotspot Blocks**: Using a dedicated swarm port (`14224`) and an asynchronous subnet discovery thread, we successfully establish P2P TCP handshakes across complex mobile hotspot configurations, bypassing OS-level multicast blocks.

### 3. Zero-Knowledge Proximity Handshakes
*   **Zero Coordinate Leaks**: AuraRadar uses homomorphic mathematics to verify that two peers are close without ever revealing their raw GPS coordinates.
*   **Advanced Cryptography**: Built on **Paillier homomorphic coordinate blinding** combined with **Merlin transcript Bulletproof range proofs**, providing absolute cryptographic privacy for your physical movements.

### 4. субъективное Gossip Reputation System
*   **Relational Reputation**: Your "Aura Score" is calculated subjectively by your device based on gossip routing, preventing global sybil/rating attacks while preserving neighborhood-level trust.

---

## 📊 Technical Stack Summary

| Layer | Technologies & Implementations |
| --- | --- |
| **Frontend UI** | React (Vite), Vanilla CSS, Lucide Icons, Glassmorphic Styling |
| **Native Core** | Rust, Tauri v2 (IPC Bridge, Native Notifications) |
| **Database** | SQLite + SQLCipher (`rusqlite` + `bundled-sqlcipher`) |
| **Networking** | Serverless P2P Mesh (`libp2p` / Gossipsub / Subnet Dialing) |
| **Cryptography** | Paillier Homomorphic Encryption, Merlin Bulletproofs |
| **Licensing** | AGPL v3 |

---

## ⚙️ Building AuraRadar

AuraRadar uses a standard Unix-style `Makefile` to simplify building, testing, and deploying across multiple platform targets.

### Prerequisites
*   [Rust Toolchain](https://rustup.rs/) (cargo, rustc)
*   [Node.js](https://nodejs.org/) & npm
*   Android NDK & SDK (required for mobile/APK builds)

### Development Commands

Start the full Desktop native app (Rust backend + Web interface):
```bash
make run
```

Build the local Android development client (APK):
```bash
make build-local
```

Compile the optimized, signed production release packages (AAB and APK):
```bash
make build
```

Deploy the client directly to all connected USB Android devices:
```bash
make deploy
```

---

## 📄 License

Licensed under the **GNU Affero General Public License v3 (AGPL v3)**. See [LICENSE](license.txt) for absolute legal transparency.
