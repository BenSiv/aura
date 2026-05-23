# AuraRadar Social Proximity Threat Model & Mitigation Framework

Proximity-based, serverless local mesh networks (like AuraRadar) enable pure, local-first social discovery completely free from corporate data tracking and algorithmic manipulation. However, eliminating the central server removes the traditional "digital gatekeeper" (Tinder, Bumble, etc.). 

This document explores the specific **social interaction scenarios** enabled by AuraRadar, contrasts them with legacy centralized platforms, analyzes the **dangerous, proximity-specific threats** introduced by local RF airwaves, and establishes concrete **technical and behavioral mitigations**.

---

## 1. Social Discovery Paradigm: AuraRadar vs. Legacy Platforms

| Dimension | Legacy Centralized Apps (Tinder/Bumble) | AuraRadar (Serverless Proximity Mesh) |
| :--- | :--- | :--- |
| **Architectural Core** | Central database collects exact GPS coordinates and matching state. | No central servers. Matches are computed peer-to-peer over local RF (mDNS, BLE). |
| **Trust Model** | Trust is placed in a corporation to protect coordinate databases and scan for bad actors. | Zero-Trust. Users own their raw data. Trust is established locally via cryptographic handshakes. |
| **Discovery Logic** | Asynchronous profiles displayed from a database based on algorithmic sorting. | Synchronous, physical co-presence. Discoveries represent real people in the same room right now. |
| **Proximity Resolution** | Coarse, delayed grid coordinates (e.g., "1 mile away") refreshed on app launch. | Precision, real-time homomorphic range verification (e.g., `< 10m` or `< 30m`). |
| **Censorship & Moderation**| Centralized bans, automated content flaggers, photo verification databases. | Localized web-of-trust, peer feedback gossip, local blocklists. |

### Positive Enabled Scenarios
1. **The Instant Serendipity Trigger**: Spontaneous, secure connections in shared community spaces (cafes, libraries, concerts) based on shared real-time vibrations without exchanging social handles or phone numbers.
2. **Double-Blind Proximity Matches**: Validating that two people sitting in the same room share mutual interest before either party has to reveal their identity, preventing awkward social rejections.
3. **Decentralized Safe Spaces**: Instant ad-hoc mesh networks created during events (e.g., protests, festivals) allowing highly secure communication when external internet is down or censored.

---

## 2. Proximity-Specific Threat Vectors (The Dangerous Scenarios)

Because AuraRadar operates on local radio frequencies (Wi-Fi, Bluetooth) and utilizes real-time distance calculations, it introduces threat vectors that are mathematically or physically impossible on centralized platforms.

### Threat A: RSSI Triangulation & Passive RF Eavesdropping
* **The Scenario**: A malicious user runs a modified Aura client or standard BLE sniffing hardware (e.g., Flipper Zero, Wi-Fi dongles) in a public space. They record the unique, ephemeral public public-key hashes and signal strength indicators (RSSI) broadcasted by a target.
* **The Danger**: By walking around a room or deploying two cheap sniffing nodes, the attacker can mathematically triangulate the target's physical seat or track their movement within a coffee shop or classroom, completely bypassing the app's distance obfuscation layers.
* **Legacy Comparison**: In centralized apps, coordinate resolution is coarse and never streamed continuously in real-time, making physical triangulation impossible.

### Threat B: "Sybil Profile Flooding" / Physical Honey-potting
* **The Scenario**: A bad actor utilizes a laptop to simulate dozens of fake AuraRadar profiles (Sybils) and coordinates their virtual locations.
* **The Danger**: The attacker creates a "social mirage"—making a desolate area appear highly active with matches. This can lure a target to specific coordinates (e.g., a quiet corner of a park or building) or manipulate them into initiating a ZK distance handshake, exposing their cryptographic identity to a malicious node.
* **Legacy Comparison**: Centralized apps use server-side device fingerprinting and GPS verification to detect and ban mass spoofing operations.

### Threat C: Zero-Knowledge Proximity Battery Exhaustion (CPU DoS)
* **The Scenario**: Performing Zero-Knowledge Paillier encryption, decryption, and Bulletproof range proofs requires significant CPU and cryptographic processing overhead on mobile chips. A malicious peer programs a script to continuously spam ZK proximity challenges to every device in a room.
* **The Danger**: Targets' devices consume high amounts of energy processing these false cryptographic requests, draining their batteries in a matter of minutes (Denial of Service).
* **Legacy Comparison**: Heavily intensive computations are typically offloaded to robust cloud servers, insulating the user's battery.

### Threat D: Stalker Identity Laundering & Collusion
* **The Scenario**: A bad actor is blocked by a local user. Because there is no centralized database or ID-verification (like phone numbers/SSNs), the stalker instantly discards their cryptographic identity and generates a new public key pair.
* **The Danger**: The stalker can continuously bypass blocks, continuing to appear on the victim's radar. Alternatively, a group of malicious users can collude to spam fake peer feedback ratings against a target, tarnishing their local reputation.
* **Legacy Comparison**: Legacy platforms employ permanent device bans, IP bans, phone number verification, and manual moderation teams.

---

## 3. AuraRadar Mitigation Framework

To guarantee physical safety, privacy, and device stability in a serverless environment, we implement a multi-layered technical and behavioral mitigation framework.

### Mitigation 1: Silence-by-Default (Ghost Mode & Asymmetric Scan)
* **Mechanism**: The **Asymmetric Stealth Scan** (Ghost Mode) enables users to actively listen for Resonant/Public peers while completely silencing their own BLE/Wi-Fi advertisements.
* **Safety Benefit**: A user walking in a public space can passively scan the room to verify it is safe and free of flagged profiles before ever revealing their own digital presence. This eliminates the "flashing light above the head" feeling.

### Mitigation 2: Double-Blind Silhouette Verification (Progressive Reveal)
* **Mechanism**: Initial peer discovery displays only **compatibility silhouettes** (resonance scores, shared tags, vague vibe descriptors). High-resolution photos, real names, and exact ages are completely encrypted and hidden.
* **Safety Benefit**: Photos and detailed bios are only decrypted when **both** users have recorded mutual "Likes" directly via an encrypted, single-hop handshake. Malicious actors scanning the room's airwaves cannot collect physical identifiers (photos/names) of nearby users.

### Mitigation 3: Randomized Coordinate Jitter & Coarse Grids
* **Mechanism**: In Paillier-based distance calculations, the client automatically injects a dynamic, time-varying noise scalar (20m to 50m) to the homomorphic blinded values when safety parameters are heightened.
* **Safety Benefit**: This blocks multi-point RSSI or distance triangulation. Even if an attacker measures precise mathematical distances, the noise vector ensures they can only determine a general zone rather than an exact seat.

### Mitigation 4: Proof-of-Work (PoW) Handshake Rate Limiting
* **Mechanism**: Before a client will dedicate CPU threads to compute Paillier or Bulletproof proofs for a peer, the initiating peer must provide a valid SHA-256 hash collision proof (a small computational puzzle, similar to Bitcoin mining or Hashcash).
* **Safety Benefit**: While negligible for a legitimate user (takes ~200ms once), this computationally exhausts a malicious actor trying to spam thousands of ZK challenges in a public room, nullifying CPU/battery exhaustion attacks.

### Mitigation 5: Decentralized Web-of-Trust (WoT) & Key Rotation
* **Mechanism**: Proximity profiles are tied to local reputations. Instead of trust being all-or-nothing, peer feedback ratings (`peer_feedback`) are weighted based on **Web-of-Trust graph depth**. Ratings from users with whom the target has positive mutual interactions carry massive weight; ratings from anonymous, unlinked keys are filtered out.
* **Safety Benefit**: Neutralizes rating collusion and makes "identity laundering" ineffective, as brand-new keys start with zero reputation and cannot affect established users.

### Mitigation 6: Persistent Chat Email Bridge Failover
* **Mechanism**: Once a mutual connection is validated, users are encouraged to bridge their chat to the SMTP/IMAP network. 
* **Safety Benefit**: This allows communication to continue safely at a distance. Users no longer need to hang around in physical proximity to keep talking, removing the incentive for stalkers to hover around a target's physical coordinates.
