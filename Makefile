# Aura Project Makefile (Tauri Migration)

# Settings
BLD = bld
BIN = bin
SRC = src
CNF = cnf
PUB = pub
RES = res

# Get version from package.json
VERSION = $(shell grep '"version":' $(CNF)/package.json | cut -d'"' -f4)

# Default action
all: run

# Run the web and native development server (Tauri + Vite)
run:
	@echo "Starting Aura Tauri Dev Server..."
	@npm run tauri dev

# Build the Android development client via Tauri
build-dev-android:
	@echo "Building Aura Android Dev Client (Tauri)..."
	@npm run tauri android dev

# Build the Android APK locally
build-local:
	@echo "Building Aura Android APK (Tauri)..."
	@npm run build
	@npm run tauri android build

# Release pipeline
release:
	@echo "Packaging Aura v$(VERSION)..."
	@mkdir -p $(PUB)/v$(VERSION)
	@git tag -a v$(VERSION) -m "Release v$(VERSION)" || true
	@echo "Building production web and android bundle..."
	@npm run build
	@npm run tauri android build
	@echo "Version v$(VERSION) packaged."

# Install dependencies
install:
	@echo "Installing dependencies..."
	@npm install

# Clean temporary files
clean:
	@echo "Cleaning up..."
	@rm -rf node_modules
	@rm -rf $(BIN)
	@rm -rf $(SRC)/core/target
	@cargo clean --manifest-path $(SRC)/core/Cargo.toml
