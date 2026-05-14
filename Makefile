# Aura Project Makefile

# Settings
CNF = cnf
BIN = bin
SRC = src
DEP = dep
PUB = pub
RES = res

# Get version from config
VERSION = $(shell grep '"version":' $(CNF)/app.json | cut -d'"' -f4)

# Default action
all: run

# Run the web development server
run:
	@echo "Starting Aura Web Server..."
	@cd $(CNF) && npx expo start --web

# Build the Android development client
build-dev-android:
	@echo "Building Aura Android Dev Client..."
	@cd $(CNF) && npx eas-cli build --profile development --platform android

# Build the Android APK for testing
build-apk:
	@echo "Building Aura Android APK (Preview)..."
	@cd $(CNF) && npx eas-cli build --profile preview --platform android

# Release pipeline
release:
	@echo "Packaging Aura v$(VERSION)..."
	@mkdir -p $(PUB)/v$(VERSION)
	@git tag -a v$(VERSION) -m "Release v$(VERSION)" || true
	@echo "Exporting web bundle..."
	@cd $(CNF) && npx expo export -p web
	@mv $(CNF)/dist $(PUB)/v$(VERSION)/web
	@echo "Version v$(VERSION) published to $(PUB)/v$(VERSION)/"

# Install dependencies
install:
	@echo "Installing dependencies..."
	@cd $(CNF) && npm install

# Clean temporary files
clean:
	@echo "Cleaning up..."
	@rm -rf $(DEP)
	@rm -rf node_modules
	@rm -rf $(CNF)/node_modules
	@rm -rf $(CNF)/.expo
	@rm -rf .expo
