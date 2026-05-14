# Local Android Build Setup

This document guides you through setting up a fully local build environment for Aura on a Linux machine. This allows you to bypass cloud build queues and compile APKs directly on your hardware.

## 1. Prerequisites

### Java Development Kit (JDK) 17
Aura requires **OpenJDK 17**. If you have multiple Java versions, ensure 17 is the default.

**Installation:**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

**Switching to Java 17:**
```bash
sudo update-alternatives --config java
sudo update-alternatives --config javac
```
*Select the option corresponding to Java 17.*

---

## 2. Android Build Tools

### Android Studio
The easiest way to manage the SDK and NDK.

**Installation (via Snap):**
```bash
sudo snap install android-studio --classic
```

**Initial Configuration:**
1.  Launch Android Studio (`android-studio`).
2.  Complete the **Setup Wizard** (Standard).
3.  Navigate to **SDK Manager** (More Actions -> SDK Manager).
4.  In the **SDK Tools** tab, install:
    *   **NDK (Side by side)**: Required for SQLCipher encryption.
    *   **CMake**: Required for native compilation.
    *   **Android SDK Build-Tools**.

---

## 3. Environment Variables
Ensure your shell knows where the Android SDK is located. Add these to your `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
*Run `source ~/.bashrc` to apply the changes.*

---

## 4. Automated Setup Script
You can use the provided setup script in the `bld/` directory to verify your environment:

```bash
bash bld/setup_local_build.sh
```

---

## 5. Building Aura
Once the environment is [OK], use the master Makefile from the project root:

| Command | Action |
| :--- | :--- |
| `make build-local` | Compiles a standalone Android APK on your machine. |
| `make build-dev-android` | Builds a development client for real-time debugging. |

---

## 6. Low-RAM Optimizations
If you are building on a machine with limited RAM (e.g., 8GB or less), Aura is pre-configured with several optimizations:

*   **Node.js Memory Limit:** The `Makefile` automatically sets `--max-old-space-size=2048` for build commands to prevent Node from consuming excessive memory.
*   **Temporary Directory Redirection:** Since `/tmp` is often limited on some systems (e.g., `tmpfs`), the `Makefile` redirects the build's temporary files to `~/.aura-build-tmp` to ensure there is enough space for project compression and staging.
*   **Gradle Constraints:** The `bld/setup_local_build.sh` script configures your global `~/.gradle/gradle.properties` to:
    *   Limit heap size to 2GB.
    *   Disable parallel execution.
    *   Limit worker processes to 1.
    *   Disable the Gradle daemon to free memory after the build completes.

If you still encounter "Out of Memory" errors, consider closing all other applications (browser, IDE) before running the build.

### Artifacts
Local build outputs will be placed in the `bin/` directory (which is ignored by Git).
