#!/bin/bash
# Aura F-Droid Build Local Simulation Script
# Replicates the exact prebuild and build environment of the F-Droid server to ensure compatibility.
# Strict ASCII Only.

set -e

# Define SRCDIR as the root directory of the repository
SRCDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Simulating F-Droid Build Environment ==="
echo "Repository Root (SRCDIR): $SRCDIR"
echo ""

# Step 1: Prebuild - Rust Targets Setup
echo "[*] Adding required Rust cross-compilation targets..."
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android

# Step 2: Prebuild - Frontend Dependencies and Compilation
echo ""
echo "[*] Installing frontend dependencies in cnf/..."
cd "$SRCDIR/cnf"
npm install

echo ""
echo "[*] Compiling frontend (Vite & TypeScript)..."
npm run build

# Step 3: Prebuild - Symlink setup for offline Tauri CLI resolution
echo ""
echo "[*] Setting up offline node_modules symlink for Tauri CLI..."
# Remove any existing symlink or folder first
rm -rf "$SRCDIR/src/core/node_modules"
ln -s "$SRCDIR/cnf/node_modules" "$SRCDIR/src/core/node_modules"
echo "[+] Symlink created: src/core/node_modules -> cnf/node_modules"

# Step 4: Build - Tauri Android Build
echo ""
echo "[*] Commencing Tauri Android release build..."
cd "$SRCDIR/src/core"

# Run Tauri android build for APKs in release mode
npx @tauri-apps/cli android build --apk

echo ""
echo "=========================================================="
echo "[SUCCESS] F-Droid simulation build completed successfully!"
echo "Generated unsigned APK: $SRCDIR/src/core/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk"
echo "=========================================================="
