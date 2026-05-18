# Privacy Policy for Aura

**Effective Date: May 18, 2026**

Aura ("we", "our", or "us") is dedicated to reclaiming connection while ensuring the absolute privacy, security, and data sovereignty of our users. Aura is built as a **decentralized, local-first networking utility**. This means your personal data, messages, and profile configurations live solely on your physical device, encrypted, and are never transmitted to any centralized servers.

By using the Aura mobile application, you agree to the practices outlined in this Privacy Policy.

---

## 1. Core Architecture & Zero Data Collection

Unlike traditional applications, **Aura does not utilize centralized databases, servers, or cloud backends.**
* **No Server Storage**: We do not collect, process, or store your personal data on any remote servers. 
* **Complete On-Device Encryption**: Any information you enter (including your profile, preferences, and connections) is stored locally on your device in an encrypted **SQLCipher** database.
* **No Analytics or Telemetry**: Aura does not contain any proprietary tracking SDKs, invasive third-party analytics (such as Firebase or Google Analytics), or telemetry layers.

---

## 2. Permissions Required & How They Are Used

To enable Peer-to-Peer (P2P) discovery and real-world connection without a central server, Aura requires specific system permissions on your Android device. We only request permissions essential for the app's functionality:

### A. Location & Bluetooth (Nearby Devices) Permissions
* **Why it is needed**: The Android Operating System requires Bluetooth Low Energy (BLE) and fine location permissions to scan for and connect to nearby hardware devices.
* **How it is used**: Aura's background P2P engine utilizes **libp2p** and BLE to discover other Aura nodes within physical proximity ("Resonances"). 
* **Data Privacy**: Location and Bluetooth signal data are processed purely in-memory on your device to establish direct connections. **We never track, upload, share, or log your physical location.**

### B. Local Storage / Files Access
* **Why it is needed**: Aura must write and read its local encrypted SQLCipher database to persist your profile, settings, and network gossip.
* **How it is used**: Used exclusively to store app configurations locally.

---

## 3. Decentralized "Aura Score" (Reputation Mesh)

Aura employs a subjective, decentralized reputation model:
* Reputation scores (your "Aura Score") and confidence ratings are calculated **locally** on your device based on secure cryptographic gossip received directly from peer devices over the local mesh.
* This metadata is processed locally and never uploaded to a global directory or centralized registry.

---

## 4. Open Source Transparency

To guarantee the validity of our privacy statements, the entire codebase of Aura is completely open source under the **GNU Affero General Public License v3 (AGPL v3)**. You, or any independent auditor, can review the entire source code at:
[https://github.com/bensiv/aura](https://github.com/bensiv/aura)

---

## 5. Children's Privacy

Because Aura processes all data locally on the user's device and does not collect any personal information on servers, we do not knowingly collect or solicit personal data from children under the age of 13.

---

## 6. Changes to this Privacy Policy

We may update our Privacy Policy from time to time to reflect changes in our local discovery mechanisms. Any updates will be announced directly within the application and updated in the project repository.

---

## 7. Contact Us

If you have any questions or feedback regarding this local-first Privacy Policy, please contact the developer:
* **Developer Name**: Ben Sivan
* **Open Source Repository**: [https://github.com/bensiv/aura/issues](https://github.com/bensiv/aura/issues)
