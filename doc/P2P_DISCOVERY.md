# P2P Discovery & Match Protocol

This document outlines the decentralized strategy for finding and matching peers in Aura without a central server.

## 1. The Core Philosophy
Aura is **serverless**. Discovery must happen through gossip and decentralized relays, ensuring that no single entity (including the Aura project) knows who is swiping on whom.

## 2. Technology Stack
To achieve privacy-preserving discovery, Aura utilizes the following layers:

*   **Waku (libp2p)**: A privacy-centric gossip protocol. It allows nodes to broadcast messages to a "mesh" without revealing the sender's identity to the mesh at large.
*   **Encrypted SQLite (SQLCipher)**: All discovered peer metadata is stored locally.
*   **Secure Store**: Private keys for identity signatures are stored in hardware-backed secure enclaves.

## 3. The Discovery Flow (Gossip)

### A. The "Public Aura" (Broadcast)
A user's device periodically broadcasts a **Discovery Packet** to the local mesh. This packet contains:
*   **Ephemeral Public Key**: Rotates daily to prevent tracking.
*   **Interest Tags**: A bloom filter of the user's interests (allows matching without revealing exact interest strings).
*   **Geofence Hint**: A low-resolution location hash (e.g., 5km radius) to ensure gossip stays relevant to the user's area.

### B. Peer Filtering
When a device receives a packet, it compares the **Interest Tags** against the local **AI Preference Engine**:
1.  If the match score is high, the device stores the peer's ephemeral key.
2.  The peer is then "swipable" in the local UI.

---

## 4. The Match Handshake (Double-Blind)

A "Match" in Aura is a cryptographic proof of mutual interest.

1.  **Intent to Like**: When User A swipes "Like" on User B, A's device creates a **Signed Interest Token** targeting B's public key.
2.  **Blind Gossip**: This token is encrypted so only User B can decrypt it. It is then gossiped through the network.
3.  **The Reveal**:
    *   If User B also swipes "Like" on User A, B's device will eventually receive A's token.
    *   B's device decrypts the token, verifies the signature, and generates a **Match Confirmation**.
    *   The confirmation is gossiped back to A.
4.  **Established Connection**: Only after both devices have verified the mutual signed tokens is the "Match" displayed to the users.

## 5. Privacy Advantages
*   **No Central Registry**: There is no database of "Who is single in New York."
*   **Anti-Tracking**: Ephemeral keys prevent a passive observer from mapping a user's movements over time.
*   **Metadata Resistance**: Messages are padded and routed through multiple nodes to hide traffic patterns.

## 6. Implementation Roadmap
1.  **Phase 1**: Local discovery via Bluetooth/LAN (ZeroConf).
2.  **Phase 2**: Waku Relay integration for city-wide discovery.
3.  **Phase 3**: Integration of Zero-Knowledge Proofs for distance verification.
