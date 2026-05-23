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

### Threat E: The Transit Nightmare (Visual Targeting in Confined Spaces)
* **The Scenario**: A female user is riding on a crowded bus or subway with the app active. Multiple other passengers also have the app active. Because the network detects proximity, it triggers alert notifications on the other passengers' devices.
* **The Danger**: A nearby passenger receives the notification, scans the tight, confined space of the bus visually for anyone looking at their phone matching the vibe silhouette, and approaches them physically on the spot. Because the physical environment restricts movement or escape, the target user feels trapped, targeted, and highly unsafe. 
* **Legacy Comparison**: In centralized dating apps, you swipe on someone who might be miles away, and you only chat when a mutual match is completed at your own leisure. The app never alerts nearby strangers of your exact physical co-presence inside a specific vehicle.

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

### Mitigation 7: Automated Transit Cloaking (Velocity & Density Defense)
* **Mechanism**: The app monitors device velocity (via coarse cellular/GPS speed metrics) and ambient mesh node density. If the speed matches vehicle movement (> 15 km/h) or if more than 3 active nodes are detected within a sub-10m radius, the app **automatically and silently switches to Stealth Scan (Ghost Mode)**.
* **Safety Benefit**: This completely prevents broadcasts in highly confined, unescapable spaces like buses, subways, trains, and elevators. The user continues to receive passive vibes but is completely invisible to others during the journey.

### Mitigation 8: Elimination of Passive Proximity Notifications
* **Mechanism**: The native tauri core never triggers active OS push/system notifications ("Aura Proximity Detected") for public or un-matched profiles. Proximity discoveries quietly populate the on-app Radar screen without buzzing or flashing interrupting banners.
* **Safety Benefit**: Passive mesh encounters remain completely silent. Nearby strangers are not actively prompted or alerted to look around their environment unless they are manually gazing at their phone within the app, reducing the rate of spontaneous real-life approaches.

### Mitigation 9: Absolute Visual Anonymization of Vibe Silhouettes
* **Mechanism**: Vibe Silhouettes contain strictly non-visual, non-physical attributes. Gender, age, physical descriptors, hair color, and precise distances are entirely stripped. Silhouettes only present abstract compatibility vectors (e.g. "92% compatibility") and generic lifestyle tags (e.g. "Jazz, Cooking").
* **Safety Benefit**: It is physically impossible for a stranger to look around a crowded bus and link a specific passenger to a profile card on their screen, as the profile lacks any physical correlate. Visual identity is only revealed once double-blind matching completes.

---

## 4. Evaluation of Proposed Proximity-Based Image Blurring (The Blur Vector)

An intuitive safety proposal is to dynamically apply a visual blur (e.g. Gaussian blur) to profile images in extreme physical proximity (e.g. within 5 meters), returning to clear rendering when the peer moves further away. 

While appealing in theory, a rigorous security evaluation reveals four critical engineering and safety drawbacks:

1. **The Boundary-Side-Channel Leak (Reverse Triangulation)**:
   * **The Vulnerability**: A discrete UI transition (blurred to clear) acting at a precise distance threshold serves as a mathematical boundary marker. 
   * **The Threat**: A malicious user can move slightly, noting the exact step where the image transitions. By plotting three transition spots, they can perform highly precise physical triangulation, revealing the target's exact coordinates.

2. **UI Interception Bypass (False Sense of Security)**:
   * **The Vulnerability**: A CSS or app-level blur is only applied at the display layer. 
   * **The Threat**: If the underlying image data has already been transmitted over the local mesh network, a malicious actor running a custom client can easily intercept the raw, unblurred image bytes from the P2P traffic and view it in high definition, making the UI blur completely useless.

3. **RSSI Noise & Flickering UX**:
   * **The Vulnerability**: Local radio frequencies (Bluetooth/Wi-Fi RSSI) fluctuate constantly due to walls, bodies, and moving metal.
   * **The Threat**: In a moving environment like a bus or train, the calculated distance would bounce wildly, causing the profile image to erratically flicker between blurred and unblurred, frustrating users and leaking spatial telemetry.

4. **Sabotaging Legitimate In-Person Discovery**:
   * **The Vulnerability**: If two users are *already* validated mutual matches, they explicitly require each other's visual cues (photos/names) to find and approach one another in the real world. 
   * **The Threat**: Automatically blurring the photo when they get close makes it impossible for mutual matches to recognize each other in a crowd. Conversely, if they are *not* mutual matches, their photos should be completely hidden rather than blurred, as a blurred photo still leaks skin tone, clothing shapes, and general silhouettes, which are enough to visually target someone on a bus.

---

## 5. The Asymmetric Resolution of the Discovery Paradox

The conflict of desires between men and women in proximity discovery is a classic game-theoretic coordination problem:
* **The Male Scarcity Dynamic**: High-volume, low-friction visibility and direct real-world approaches.
* **The Female Vulnerability Dynamic**: High-precision filtering, physical safety, and complete control over digital exposure.

On legacy platforms, this tension degrades into a toxic, low-value equilibrium: men send spam messages to stand out, women feel overwhelmed and delete the app, and overall connection rates collapse.

### Aura's Solution: Asymmetric Equilibrium

AuraRadar resolves this paradox not by forcing a single, symmetric compromise, but by embracing a **complementary, asymmetric design**:

```
 ┌────────────────────────────────────────┐
 │       Proactive Broadcasters           │ (Typically Men)
 │       * "Resonant" or "Public" Mode     │ 
 └───────────────────┬────────────────────┘
                     │ (Passive Airwave Broadcast)
                     ▼
 ┌────────────────────────────────────────┐
 │         Passive Stealth Scanners       │ (Typically Women)
 │         * Invisible "Ghost" Mode       │
 └───────────────────┬────────────────────┘
                     │ (Conscious, Highly Targeted Handshake)
                     ▼
 ┌────────────────────────────────────────┐
 │       Mutual Cryptographic Match       │
 │       * Identity Decrypted & Revealed  │
 └────────────────────────────────────────┘
```

1. **Safety for Women**: By operating in **Stealth Scan (Ghost Mode)**, women gain **100% selective safety**. They walk through physical spaces completely invisible, scanning ambient signals and observing profiles at their own pace. They are immune to triangulation, visual targeting on buses, and cold physical approaches.
2. **Success for Men**: Instead of cold-approaching strangers or spamming messages in the dark, men who choose to broadcast are rewarded with **high-intent, verified handshakes**. A targeted handshake from a stealth scanner represents a peer who has already vetted their vibes, checked compatibility, and initiated a secure connection.
3. **Harmonized Desires**: By dividing roles into **Active Broadcasters** and **Silent Selectors**, both genders receive exactly what they need: women receive absolute safety and spatial control, while men receive high-quality, mutual-intent real-world connections. 

### 5.1. The Out-of-Proximity Communication Flow

If a Stealth Scanner decides to delay matching for safety reasons—only approving the handshake hours later when they are in a safe, private location—they are no longer in active local RF (Bluetooth/Wi-Fi) range of the Broadcaster. 

To bridge this spatial gap without relying on centralized dating servers, AuraRadar utilizes the **IMAP/SMTP Email Bridge** as a long-range federated fallback:

```
                  ┌───────────────────────────────┐
                  │    LOCAL DISCOVERY (Mesh)     │
                  │  * Silent scan & record vibe  │
                  └───────────────┬───────────────┘
                                  │ (Target peer leaves proximity)
                                  ▼
                  ┌───────────────────────────────┐
                  │  DELAYED MATCHING (Offline)   │
                  │  * User accepts match at home │
                  └───────────────┬───────────────┘
                                  │ (Triggers encrypted SMTP email)
                                  ▼
                  ┌───────────────────────────────┐
                  │  IMAP POLL & REGISTRATION     │
                  │  * Peer pulls match via IMAP  │
                  └───────────────┬───────────────┘
                                  │ (Establishes async chat channel)
                                  ▼
                  ┌───────────────────────────────┐
                  │  LONG-RANGE FEDERATED CHAT    │
                  │  * Bridged over email transport│
                  └───────────────────────────────┘
```

1. **The Ephemeral Discovery Handshake**: During the initial local proximity scan, the Stealth Scanner's device silently caches the Broadcaster’s public key and public email address metadata (derived from their public profile packet).
2. **The Delayed Match (Asynchronous SMTP)**: When the Stealth Scanner is home and clicks "Accept", their device generates an encrypted validation packet. Since the Broadcaster is out of range, the app sends this packet as an end-to-end encrypted email via SMTP to the Broadcaster's federated address.
3. **The Recipient Registration (Asynchronous IMAP)**: The Broadcaster's client periodically polls their IMAP mailbox. Upon receiving the validation email, the client decrypts it, registers the mutual match, and displays the profile in their local SQLite database.
4. **Seamless Long-Range Chatting**: When either user opens the chat, [ChatScreen.tsx](file:///home/bensiv/Projects/auraradar/src/ui/screens/ChatScreen.tsx) detects they are out of mesh range and seamlessly routes all messages as Autocrypt-encrypted emails via the SMTP/IMAP bridge. 
5. **Proximity Re-up**: If they happen to walk into the same cafe or shared space in the future, the app automatically detects the mesh beacon and seamlessly hot-swaps the transport back to real-time, zero-latency local Gossipsub.


