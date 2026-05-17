# Aura Project Makefile (Strict Unix Organization)

# Paths
BLD = bld
CNF = cnf
DOC = doc
OUT = out
PUB = pub
RES = res
SRC = src
WWW = web
DEP = dep

# Version from cnf/package.json
VERSION = $(shell grep '"version":' $(CNF)/package.json | cut -d'"' -f4)

# Commands (using explicitly pointed config)
# We run from root but point tools to cnf/
VITE = npx vite --config $(CNF)/vite.config.ts
TSC  = npx tsc -p $(CNF)/tsconfig.json
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
	@cd $(CNF) && npx vite build
	@$(TAURI) android build --debug
	@mkdir -p $(PUB)
	@cp $(SRC)/core/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk $(PUB)/aura-debug.apk
	@echo "Local build complete: $(PUB)/aura-debug.apk"

# Build production bundle
build:
	@echo "Building production web and android bundle..."
	@$(TSC)
	@cd $(CNF) && npx vite build
	@$(TAURI) android build

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
	@cd $(CNF) && npm install

# Clean output
clean:
	@echo "Cleaning up..."
	@rm -rf $(OUT)
	@cargo clean --manifest-path $(SRC)/core/Cargo.toml
	@if [ -d "$(SRC)/core/gen/android" ]; then cd $(SRC)/core/gen/android && ./gradlew clean; fi

# Deploy to all connected devices
deploy:
	@./$(BLD)/deploy_to_all.sh
