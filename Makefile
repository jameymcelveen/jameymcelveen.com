.PHONY: help setup install dev build start lint format format-check clean

# Detect OS
UNAME_S := $(shell uname -s)
UNAME_M := $(shell uname -m)

# Default target
help:
	@echo "Available targets:"
	@echo "  make setup       - Run platform-specific setup script"
	@echo "  make install     - Install dependencies"
	@echo "  make dev         - Start development server"
	@echo "  make build       - Build for production"
	@echo "  make start       - Start production server"
	@echo "  make lint        - Run ESLint"
	@echo "  make format      - Format code with Prettier"
	@echo "  make format-check - Check code formatting"
	@echo "  make clean       - Clean build artifacts"

# Platform-specific setup
setup:
	@echo "Detecting platform..."
ifeq ($(UNAME_S),Linux)
	@echo "Running Linux setup..."
	@bash scripts/dev-setup-linux.sh
else ifeq ($(UNAME_S),Darwin)
	@echo "Running macOS setup..."
	@bash scripts/dev-setup-mac.sh
else
	@echo "Unsupported platform: $(UNAME_S)"
	@echo "Please run the appropriate setup script manually:"
	@echo "  - Windows: .\\scripts\\dev-setup-windows.bat"
	@echo "  - Mac: bash scripts/dev-setup-mac.sh"
	@echo "  - Linux: bash scripts/dev-setup-linux.sh"
	@exit 1
endif

# Install dependencies
install:
	@echo "Installing dependencies..."
	@pnpm install

# Development server
dev:
	@echo "Starting development server..."
	@pnpm dev

# Build for production
build:
	@echo "Building for production..."
	@pnpm build

# Start production server
start:
	@echo "Starting production server..."
	@pnpm start

# Lint code
lint:
	@echo "Running ESLint..."
	@pnpm lint

# Format code
format:
	@echo "Formatting code..."
	@pnpm format

# Check formatting
format-check:
	@echo "Checking code formatting..."
	@pnpm format:check

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf .next
	@rm -rf out
	@rm -rf dist
	@echo "Clean complete!"
