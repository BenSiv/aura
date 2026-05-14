# Aura 🌌

The Decentralized, Privacy-First, Open Source Dating App.

## 🚀 Vision
Aura is built to be the "perfect" dating app:
- **100% Open Source & Free**: No hidden algorithms or paywalls.
- **Privacy-First**: No central server profiles. All your swipes and preferences stay on your device.
- **Local AI**: Implicit preference learning happens locally via on-device inference.
- **Copyleft**: Licensed under **GNU AGPL v3** to ensure it remains a community utility forever.

## 🛠️ Tech Stack
- **Framework**: React Native (Expo)
- **Database**: SQLite with SQLCipher (256-bit AES Encryption)
- **Security**: Hardware-backed keys via `expo-secure-store`
- **AI**: On-device tag-weighting engine

## 📦 Building Aura

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

## ⚖️ License
Licensed under the **GNU Affero General Public License v3 (AGPL v3)**. See [LICENSE.txt](./LICENSE.txt) for details.
