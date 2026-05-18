# Aura Publishing & Distribution Guide

This guide details the step-by-step process for compiling production-ready release builds, signing them securely, and submitting the Aura app to **F-Droid**, the **Google Play Store**, and preparing for **Apple iOS** compilation.

---

## 1. Publishing on Google Play Store

To publish on the Google Play Store, you must generate a secure **Keystore**, configure Tauri to sign your release builds, compile a production Android App Bundle (`.aab`), and upload it to the Google Play Console.

### Step 1.1: Generate a Production Release Key
Run the following command in your terminal to generate a secure keystore file. 

> [!WARNING]
> Keep this keystore file and its passwords extremely secure. If you lose this key, you will never be able to update your app on the Google Play Store.

```bash
keytool -genkey -v -keystore cnf/aura-release.keystore \
  -alias aura-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
This will generate `cnf/aura-release.keystore`. Make sure to **never commit this keystore to a public Git repository** (it should be added to `.gitignore`).

### Step 1.2: Configure Environment Variables for Signing
Tauri's Android compiler automatically signs your package if specific environment variables are set during compilation. Add these variables to your shell or compile environment:

```bash
export TAURI_ANDROID_KEYSTORE_PATH="/home/bensiv/Projects/aura/cnf/aura-release.keystore"
export TAURI_ANDROID_KEYSTORE_PASSWORD="your_keystore_password"
export TAURI_ANDROID_KEY_ALIAS="aura-key-alias"
export TAURI_ANDROID_KEY_PASSWORD="your_key_password"
```

### Step 1.3: Compile the Production Bundle (`.aab`)
Google Play requires `.aab` (Android App Bundle) formats instead of `.apk`. Run the production build command:

```bash
# Compile production build
make build
```
This will compile a production release bundle and output the signed `.aab` file to:
`src/core/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab`

### Step 1.4: Upload to Google Play Console
1. Register for a developer account at the [Google Play Console](https://play.google.com/console/signup) (one-time $25 fee).
2. Click **Create app** and fill in your app details (Name, Default Language, App vs. Game, Free vs. Paid).
3. Set up your **Store Presence** (Description, Custom Icons, App Screenshots).
4. Go to **Production** under the *Release* section, click **Create new release**, and upload your `app-universal-release.aab` bundle.
5. Fill out the mandatory App Content questionnaires (Target age, privacy policy, content rating) and click **Start Rollout to Production**!

---

## 2. Publishing on F-Droid

F-Droid is a repository for Free and Open Source Software (FOSS) on Android. F-Droid compiles and builds applications **directly from their source code** on their own secure build servers, ensuring full transparency, security, and reproducibility.

### Submission Requirements
To be accepted into the official F-Droid repository, Aura must satisfy:
1. **Fully Open Source**: No proprietary analytics, tracking SDKs, or invasive telemetry.
2. **Built from Source**: The build server compiles your Rust and React source natively.
3. **No Precompiled Binaries**: All dependencies must be built from source or fetched from open-source registries during the allowed `prebuild` phase.

### Submission Steps

#### Step 2.1: Tag and Push the Release
F-Droid builds from tag references. Ensure your semantic version tag is pushed:
```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

#### Step 2.2: Prepare the Metadata Recipe File
To tell the F-Droid build server how to compile Aura, you must submit a YAML recipe named after the app's App ID (`com.bensivan.aura.yml`). 

The recipe is submitted via a Merge Request (MR) in the official [fdroiddata GitLab repository](https://gitlab.com/fdroid/fdroiddata).

Create the file `mdt/com.bensivan.aura.yml` with the following configuration:

```yaml
Categories:
  - Chat
  - Internet
License: AGPL-3.0-only
SourceCode: https://github.com/bensiv/aura
IssueTracker: https://github.com/bensiv/aura/issues

RepoType: git
Repo: https://github.com/bensiv/aura.git

Builds:
  - versionName: 0.1.0
    versionCode: 1
    commit: v0.1.0
    subdir: src/core/gen/android
    node: yes
    rust: yes
    ndk: 27.1.12297006
    gradle:
      - assembleUniversalRelease
    prebuild:
      # 1. Install required Rust targets for cross-compiling the core
      - rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
      # 2. Install node dependencies and compile web assets (TSC & Vite) to `out/`
      - cd $SRCDIR/cnf && npm install
      - cd $SRCDIR/cnf && npm run build
      # 3. Create a local node_modules symlink in src/core so the offline gradle build can find @tauri-apps/cli
      - ln -s $SRCDIR/cnf/node_modules $SRCDIR/src/core/node_modules
      # 4. Fetch Rust dependencies while network is still available
      - cd $SRCDIR/src/core && cargo fetch
    output: src/core/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk
```

> [!IMPORTANT]
> **Why do we need the symlink?**
> The F-Droid build server turns off network access completely during the `gradle` execution phase. Since Tauri's custom Gradle plugin invokes `npx @tauri-apps/cli` internally during compilation, creating a symlink to `$SRCDIR/cnf/node_modules` inside `src/core` allows `npx` to locate the CLI locally and run completely offline!

#### Step 2.3: Test the Build Locally (Optional but Recommended)
Before opening the GitLab Merge Request, you can test if F-Droid compiles your app flawlessly using their local build tools:

1. **Install F-Droid Server Tools & Docker**:
   ```bash
   sudo apt install docker.io python3-pip
   pip3 install fdroidserver
   ```
2. **Clone the fdroiddata Repository**:
   ```bash
   git clone https://gitlab.com/fdroid/fdroiddata.git
   cd fdroiddata
   ```
3. **Copy your Recipe & Test Build**:
   Place your `com.bensivan.aura.yml` into the `mdt/` directory and run:
   ```bash
   fdroid build --docker -v com.bensivan.aura
   ```
   *This command runs a Docker container replicating the exact F-Droid server environment, downloads dependencies, and builds the unsigned APK.*

#### Step 2.4: Submit to F-Droid
1. Fork [fdroid/fdroiddata](https://gitlab.com/fdroid/fdroiddata) on GitLab.
2. Commit your new recipe file to a feature branch: `mdt/com.bensivan.aura.yml`.
3. Open a Merge Request against the `master` branch.
4. F-Droid's automated CI will run a test build. Once a maintainer reviews and merges the recipe, your app will automatically compile and appear on F-Droid within a few days!

---

## 3. Building for Apple iOS (Future Scope)

Tauri 2.x natively supports compilation for Apple iOS, allowing you to generate an iOS Xcode workspace and compile a native `.ipa` package for iPhones.

### Requirements
*   **Mac Hardware**: A computer running macOS (MacBook, Mac mini, Mac Studio). macOS is required because the iOS compilation pipeline relies on Apple's native Xcode compiler chain.
*   **Xcode**: Installed from the Mac App Store (includes native iOS simulators and compilers).
*   **Apple Developer Account**: Required to test on physical iPhones and publish on the iOS App Store (annual $99 fee).

### Compilation Pipeline Setup (On your future Mac)

#### Step 3.1: Install CocoaPods & Rust iOS Targets
Install the required package managers and target toolchains on your Mac:
```bash
# Install CocoaPods (iOS dependency manager)
brew install cocoapods

# Add target architectures for iOS compilation
rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim
```

#### Step 3.2: Initialize iOS Workspace
Run the Tauri setup module inside `src/core/` to create the Xcode workspace:
```bash
cd src/core
npx tauri ios init
```
This command generates the iOS source wrapper files under `src/core/gen/apple/`.

#### Step 3.3: Launch iOS Simulator (Dev Mode)
To run Aura in dev mode inside an active iPhone simulator on your Mac:
```bash
npx tauri ios dev
```

#### Step 3.4: Build & Sign in Xcode
To compile a release build for the App Store:
```bash
npx tauri ios build
```
This generates an Xcode project workspace (`Aura.xcworkspace`) under `src/core/gen/apple/`.
1. Open this workspace in **Xcode**.
2. Select your **Aura Target**, go to the **Signing & Capabilities** tab, and select your Apple Developer Team.
3. Xcode will automatically provision signing certificates.
4. Select **Product > Archive** to compile the release package and submit it directly to **App Store Connect** / **TestFlight**!
