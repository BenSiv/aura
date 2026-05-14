# Aura Project Makefile

# Settings
CNF = cnf
BIN = bin
SRC = src
DEP = dep

# Default action
all: run

# Run the web development server
run:
	@echo "Starting Aura Web Server..."
	@cd $(CNF) && npx expo start --web

# Build the Android development client
build-android:
	@echo "Building Aura Android Client..."
	@cd $(CNF) && npx eas-cli build --profile development --platform android

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
	@rm -rf .expo
