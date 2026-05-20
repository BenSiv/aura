# Aura Project Makefile (Strict Unix Organization)

# Paths
BLD = bld
CFG = cfg
DOC = doc
OUT = out
PUB = pub
RES = res
SRC = src
WWW = web
DEP = dep

# Version from cfg/package.json
VERSION = $(shell grep '"version":' $(CFG)/package.json | cut -d'"' -f4)

# Commands (using explicitly pointed config)
# We run from root but point tools to cfg/
VITE = npx vite --config $(CFG)/vite.config.ts
TSC  = npx --prefix $(CFG) tsc -p $(CFG)/tsconfig.json
TAURI = cd $(SRC)/core && npx @tauri-apps/cli

# Default action
all: run

# Run development server
run:
	@echo "Starting Aura Tauri Dev Server..."
	@$(TAURI) dev

# Build the Android development client
build-dev-android:
	@echo "Building Aura Android Dev Client..."
	@$(TAURI) android dev

# Build the local Android APK (debug)
build-local:
	@echo "Building local Android debug APK..."
	@$(TSC)
	@cd $(CFG) && npx vite build
	@$(TAURI) android build --debug
	@mkdir -p $(PUB)
	@cp $(SRC)/core/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk $(PUB)/aura-debug.apk
	@echo "Local build complete: $(PUB)/aura-debug.apk"

# Build production bundle
build:
	@echo "Building production web and android bundle..."
	@$(TSC)
	@cd $(CFG) && npx vite build
	@$(TAURI) android build
	@mkdir -p $(PUB)
	@cp $(SRC)/core/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk $(PUB)/aura-release.apk
	@cp $(SRC)/core/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab $(PUB)/aura-release.aab
	@echo "Production build complete: $(PUB)/aura-release.apk and $(PUB)/aura-release.aab"

# Release pipeline
release:
	@echo "Packaging Aura v$(VERSION)..."
	@mkdir -p $(PUB)/v$(VERSION)
	@git tag -a v$(VERSION) -m "Release v$(VERSION)" || true
	@$(MAKE) build
	@echo "Version v$(VERSION) packaged."

# Install dependencies
install:
	@echo "Installing dependencies..."
	@cd $(CFG) && npm install

# Clean output
clean:
	@echo "Cleaning up..."
	@rm -rf $(OUT)
	@cargo clean --manifest-path $(SRC)/core/Cargo.toml
	@if [ -d "$(SRC)/core/gen/android" ]; then cd $(SRC)/core/gen/android && ./gradlew clean; fi

# Deploy to all connected devices
deploy:
	@./$(BLD)/deploy_to_all.sh

# Capture app screenshots in demo mode (no manual config changes needed)
screenshot:
	@echo "Starting Vite in demo mode for screenshot capture..."
	@cd $(CFG) && npx vite --mode demo &
	@sleep 5
	@echo "Capturing screenshots..."
	@node $(BLD)/capture_screenshots.mjs
	@pkill -f "vite --mode demo" || true
	@echo "Screenshots saved to fastlane/metadata/android/en-US/images/phoneScreenshots/"
