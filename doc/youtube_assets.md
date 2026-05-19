# YouTube Video Launch Assets

This document contains ready-to-copy metadata assets for publishing the **AuraRadar** demo walkthrough on YouTube, along with the transcoding commands to compile WebP recordings into pristine MP4 videos.

---

## 🏷️ Video Title

> **AuraRadar: Open Source Dating Utility for Real-World Connection**

---

## 📝 Video Description

```markdown
Say hello to AuraRadar, a local-first, decentralized, and zero-knowledge privacy-preserving proximity network built to fight the loneliness pandemic by helping people connect directly, securely, and privately in the real world. 

Traditional dating apps have a fundamental conflict of interest—their business success relies on you staying on the app. Aura is designed to get you off your phone and into a face-to-face conversation.

In this quick demo walkthrough, we demonstrate the scan-to-match core flow using local P2P simulated nodes:
0:00 - Setup profile on encrypted local storage
0:10 - Scanning local space for nearby "Resonances"
0:18 - Encountering a nearby profile card
0:25 - Liking the profile to trigger the "Mutual Match Established" celebrate screen
0:32 - Navigating into the direct P2P mesh chat thread to send a secure greeting

🚀 Technical Architecture & Features:
• Front-End: Vite + React, Vanilla CSS (Glassmorphism design)
• Native Core: Rust, Tauri v2 (bridges the UI to native systems)
• Encrypted Local Database: SQLCipher managed directly in Rust (your "type" and swipe history never leave your hardware)
• P2P Swarm Discovery: libp2p, gossipsub, and mDNS for serverless proximity scanning
• Zero-Knowledge Handshakes: Paillier homomorphic coordinate blinding + Merlin transcript Bulletproof range proofs to verify proximity without sharing absolute coordinates!

💻 Check out the open-source repository & contribute:
GitHub: https://github.com/BenSiv/aura

#OpenSource #Tauri #Rust #P2P #ZeroKnowledge #React #Web3 #PrivacyFirst
```

---

## 🎬 How to Transcode WebP to MP4

If you record a browser session using WebP animation, run the following command from the root of the project to cleanly transcode it into a high-quality, YouTube-compatible MP4:

```bash
python3 bld/convert_webp_to_mp4.py
```

This will run the local Python-Pillow script to extract frames and output a perfectly formatted MP4 file to `pub/auraradar_scan_match_chat.mp4`.
