#!/bin/bash

echo "[*] Starting Aura Local Build Setup..."

# 1. Install Java 17
echo "[+] Checking for Java 17..."
if ! java -version 2>&1 | grep -q "17"; then
    echo "[!] Java 17 not found. Please run: sudo apt install openjdk-17-jdk"
else
    echo "[OK] Java 17 is ready."
fi

# 2. Check for Android SDK
echo "[+] Checking for Android SDK..."
if [ ! -d "$HOME/Android/Sdk" ]; then
    echo "[!] Android SDK not found in ~/Android/Sdk."
    echo "[?] Please install Android Studio and complete the Setup Wizard."
else
    echo "[OK] Android SDK found."
fi

# 3. Add Environment Variables to .bashrc if not present
echo "[+] Configuring environment variables..."
BASHRC="$HOME/.bashrc"
if ! grep -q "ANDROID_HOME" "$BASHRC"; then
    echo "" >> "$BASHRC"
    echo "# Android SDK for Aura" >> "$BASHRC"
    echo "export ANDROID_HOME=\$HOME/Android/Sdk" >> "$BASHRC"
    echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$BASHRC"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$BASHRC"
    echo "[OK] Added ANDROID_HOME to $BASHRC. Please run 'source ~/.bashrc' after this script."
else
    echo "[OK] Environment variables already configured."
fi

# 4. Optimize Gradle for low-RAM machines
echo "[+] Optimizing Gradle for low-RAM environment..."
GRADLE_PROPS="$HOME/.gradle/gradle.properties"
mkdir -p "$HOME/.gradle"

# Only add settings if they don't already exist or are set too high
update_gradle_prop() {
    local prop=$1
    local value=$2
    if ! grep -q "^$prop=" "$GRADLE_PROPS" 2>/dev/null; then
        echo "$prop=$value" >> "$GRADLE_PROPS"
        return 0
    fi
    return 1
}

update_gradle_prop "org.gradle.jvmargs" "-Xmx2048m -XX:MaxMetaspaceSize=512m"
update_gradle_prop "org.gradle.parallel" "false"
update_gradle_prop "org.gradle.workers.max" "1"
update_gradle_prop "org.gradle.daemon" "false"

echo "[OK] Gradle optimizations applied to $GRADLE_PROPS."

echo "------------------------------------------------"
echo "NEXT STEPS:"
echo "1. Run: sudo apt install openjdk-17-jdk"
echo "2. Run: sudo snap install android-studio --classic"
echo "3. Open Android Studio and install NDK (Side by side) & CMake from SDK Manager."
echo "4. Once done, run 'make build-local' from the project root."
echo "------------------------------------------------"
