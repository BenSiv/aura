# Show HN: Aura - A Local-First, Privacy-Centric Dating App with No Central Server

**Title:** Show HN: Aura – A Local-First, Privacy-Centric Dating App (AGPL v3)

**Post Content:**

Hi HN,

I’m building **Aura**, a dating app designed as a privacy-first utility rather than a data-mining business. Traditional dating apps have a fundamental conflict of interest: their success (you finding a partner) is their business failure (you leaving the app).

Aura takes a different approach by making the protocol the product.

### Key Features:
*   **Local-First Data Sovereignty**: All swiping history, matches, and chats live in an encrypted SQLCipher database on your device. Your behavioral patterns never leave your hardware.
*   **Decentralized Reputation Mesh**: Instead of a central moderator, Aura uses a peer-to-peer gossip network. Reputation is a "Relational Valence"—your score is calculated locally based on the specific gossip your device has received, making reputation a subjective perception rather than a global metric.
*   **Asymmetric Time Decay**: To prevent "reputation traps," negative signals decay 4x faster than positive ones. This allows the network to forgive past behavior while rewarding long-term positive contributions.
*   **On-Device Preference Optimizer**: Aura uses a tiny ML model in Rust to learn your preferences and optimize suggestions, adjusting local tag weights without ever uploading your "type" to a server.
*   **Mesh Networking & Store-Carry-Forward**: Discovery happens through a P2P layer. Devices act as nodes, gossiping encrypted packets. The "Store-Carry-Forward" model allows profiles to propagate through physical movement, creating a living network that scales with density.

### Latest Progress:
I’ve recently completed a major architectural migration from React Native to **Tauri + Rust**. This allowed me to implement the core mesh logic and encrypted storage in a high-performance native layer while keeping the UI flexible with React and Vite. 

I’ve also integrated lessons from an agent-based simulation (`simaura`) to handle edge cases in decentralized trust, such as "Aura Hacking" and "Redemption Arcs."

### I’m looking for contributors!
The core storage and UI foundation are solid. I’m now focusing on hardening the **P2P Sync Layer** and refining the **Intent Signaling** UI.

If you’re interested in P2P protocols, local-first architectures, or just want to help build a dating app that isn't a "Skinner Box," I'd love to have you join me.

**GitHub:** [https://github.com/BenSiv/auraradar](https://github.com/BenSiv/auraradar)

**Tech Stack:** Rust (Tauri v2), React (Vite), SQLCipher, TypeScript.

Check out `doc/simulation_lessons.md` for the theory behind the reputation mesh.

Looking forward to your feedback and thoughts!
