#!/bin/bash

# Aura Release Build & Sign Script
# Ensures build environment configuration and compile commands are fully automated.
# Strict ASCII Only, no emojis.

set -e

KEYSTORE="cfg/aura-release.keystore"
ALIAS="aura-key-alias"

echo "=== Aura Production Build and Deployment Pipeline ==="
echo ""

# Step 1: Keystore Verification
if [ ! -f "$KEYSTORE" ]; then
    echo "[!] Keystore not found at $KEYSTORE"
    echo "    Would you like to generate a new production release keystore now? (y/n)"
    read -r GENERATE
    if [ "$GENERATE" = "y" ] || [ "$GENERATE" = "Y" ]; then
        echo "[*] Generating release keystore..."
        mkdir -p cfg
        keytool -genkey -v -keystore "$KEYSTORE" \
          -alias "$ALIAS" -keyalg RSA -keysize 2048 -validity 10000
        echo "[+] Keystore successfully generated at $KEYSTORE"
    else
        echo "[Error] Keystore file is required for production builds. Exiting."
        exit 1
    fi
fi

# Step 2: Retrieve Secrets securely
echo ""
echo "Please enter your Keystore Password:"
read -rs STOREPASS
echo "Please enter your Key Alias Password:"
read -rs KEYPASS

if [ -z "$STOREPASS" ] || [ -z "$KEYPASS" ]; then
    echo "[Error] Passwords cannot be empty. Exiting."
    exit 1
fi

# Step 3: Export signing variables for Tauri's Gradle build
export TAURI_ANDROID_KEYSTORE_PATH="$(pwd)/$KEYSTORE"
export TAURI_ANDROID_KEYSTORE_PASSWORD="$STOREPASS"
export TAURI_ANDROID_KEY_ALIAS="$ALIAS"
export TAURI_ANDROID_KEY_PASSWORD="$KEYPASS"

echo ""
echo "[*] Cleaning build caches..."
make clean

echo ""
echo "[*] Compiling production Android App Bundle (AAB)..."
# Compile production build
npx tsc -p cfg/tsconfig.json
cd cfg && npx vite build && cd ..
cd src/core && npx @tauri-apps/cli android build && cd ../..

echo ""
echo "=== Build Complete! ==="
echo "Signed AAB is available at:"
echo "src/core/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab"
echo ""
echo "Use the Google Play Console to upload the AAB to production."
