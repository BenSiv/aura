# Show HN: Aura - A Local-First, Privacy-Centric Dating App with No Central Server

**Title:** Show HN: Aura – A Local-First, Privacy-Centric Dating App (AGPL v3)

**Post Content:**

Hi HN,

I’m building **Aura**, a dating app designed as a privacy-first utility rather than a data-mining business. Traditional dating apps have a fundamental conflict of interest: their success (you finding a partner) is their business failure (you leaving the app).

Aura takes a different approach by making the protocol the product.

### Key Features:
*   **Local-First Data Sovereignty**: All swiping history, matches, and chats live in an encrypted SQLCipher database on your device. Your behavioral patterns never leave your hardware.
*   **On-Device ML Engine**: Instead of filters, Aura uses an on-device AI engine to learn your preferences, adjusting local tag weights without ever uploading your "type" to a server.
*   **Mesh Networking & Store-Carry-Forward**: Discovery happens through a P2P layer (via Waku/Matrix). Devices act as nodes, gossiping encrypted packets. The "Store-Carry-Forward" model allows profiles to propagate through physical movement, creating a living network that scales with density.
*   **Incentive Aligned**: Open source (AGPL v3) and designed to be a utility. We avoid the "Skinner Box" traps of commercial apps by making the protocol the product.

### I’m looking for contributors!
I just successfully set up the core encrypted storage and the premium UI foundation. I’m now moving into the most exciting part: **The Decentralized Sync Layer**.

If you’re interested in P2P protocols, local-first architectures, or just want to help build a dating app that isn't a "Skinner Box," I'd love to have you join me.

**GitHub:** [https://github.com/BenSiv/aura](https://github.com/BenSiv/aura)

**Tech Stack:** React Native (Expo), SQLCipher, TypeScript.

Check out the `TODO.md` and the `cnf/` directory for the architecture.

Looking forward to your feedback and thoughts on the decentralization strategy!
