# Project Aura: A Local-First, Decentralized Dating Utility

**Aura** is a dating application built on the principle that digital connection should be a private utility rather than a centralized, data-mining business. By shifting from a traditional client-server model to a **decentralized, peer-to-peer (P2P)** architecture, Aura aligns the software's success with the user’s goal: finding a partner and maintaining data sovereignty.

---

### Core Architectural Pillars

#### 1. Local-First Data Sovereignty
Unlike traditional platforms, Aura does not utilize a central database to store user profiles, swiping history, or private chats.
* **Encrypted Storage:** All personal data lives in an encrypted **SQLCipher** database directly on the user’s device.
* **On-Device Processing:** Preference learning and profile ranking are handled locally via an **ML engine**. Your "type" and behavioral patterns never leave your hardware.

#### 2. Decentralized Discovery & Mesh Networking
The app replaces the central "matchmaking" server with a P2P discovery layer (leveraging protocols like **Waku** or **Matrix**).
* **The Mesh Protocol:** Each instance of the app acts as a node. In a dense environment, phones transmit not only the user’s own encrypted packet but also "gossip" packets they have received from others.
* **Store-Carry-Forward:** This allows profiles to travel across a geographic region (like a 50km radius) through the physical movement of users, effectively creating a "living" network that grows stronger with density.

#### 3. Incentive Alignment
Aura is open-source (**AGPL v3**) to ensure transparency and prevent the "Skinner Box" design common in commercial apps.
* **Protocol over Platform:** By making the protocol the product, Aura removes the conflict of interest where a company profits from keeping users on the app indefinitely.
* **Sustainability:** The project explores a "pay-for-convenience" model, where users can choose to host their own nodes or utilize community relays for regional sync without sacrificing their privacy.

---

### Technical Summary

| Feature | Implementation |
| --- | --- |
| **Tech Stack** | React Native (Expo), TypeScript |
| **Database** | SQLCipher (Local-only) |
| **Networking** | P2P / Gossip protocols (Waku, Matrix) |
| **Licensing** | AGPL v3 |
| **Target Distribution** | F-Droid |

---

## Building Aura

### Development Build
Since Aura uses native encryption modules, you must use a development build for testing.

```bash
npx eas-cli build --profile development --platform android
# or
npx eas-cli build --profile development --platform ios
```

### Local Development
```bash
npm install
npm run web # For UI development
```

### Release Pipeline
To generate a versioned publication of the app:
```bash
make release
```
This will create a git tag and export a static web build into `pub/v<version>/`.

## License
Licensed under the **GNU Affero General Public License v3 (AGPL v3)**. See [LICENSE.txt](./LICENSE.txt) for details.
