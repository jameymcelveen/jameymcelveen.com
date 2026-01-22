#!/bin/bash
# Linux Development Setup Script
# Idempotent - safe to run multiple times

set -e

echo "🐧 Linux Development Setup"
echo "========================="

# Detect package manager
if command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt"
    UPDATE_CMD="sudo apt-get update"
    INSTALL_CMD="sudo apt-get install -y"
elif command -v yum &> /dev/null; then
    PKG_MANAGER="yum"
    UPDATE_CMD="sudo yum check-update || true"
    INSTALL_CMD="sudo yum install -y"
elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
    UPDATE_CMD="sudo dnf check-update || true"
    INSTALL_CMD="sudo dnf install -y"
else
    echo "⚠️  Could not detect package manager. Please install Node.js manually."
    PKG_MANAGER="unknown"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing..."
    
    if [ "$PKG_MANAGER" = "apt" ]; then
        # Ubuntu/Debian
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        $INSTALL_CMD nodejs
    elif [ "$PKG_MANAGER" = "yum" ] || [ "$PKG_MANAGER" = "dnf" ]; then
        # RHEL/CentOS/Fedora
        curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
        $INSTALL_CMD nodejs
    else
        echo "❌ Please install Node.js 22+ manually from https://nodejs.org/"
        exit 1
    fi
else
    NODE_VERSION=$(node --version)
    echo "✅ Node.js already installed: $NODE_VERSION"
fi

# Check if nvm is installed (preferred for Node version management)
if [ -d "$HOME/.nvm" ] || [ -f "$HOME/.nvm/nvm.sh" ]; then
    echo "✅ nvm detected"
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Install Node 22 if not already installed
    if ! nvm list | grep -q "v22"; then
        echo "📦 Installing Node.js 22 via nvm..."
        nvm install 22
    fi
    
    # Use Node 22
    nvm use 22
    echo "✅ Using Node.js $(node --version)"
else
    echo "ℹ️  nvm not found. Using system Node.js."
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
else
    PNPM_VERSION=$(pnpm --version)
    echo "✅ pnpm already installed: v$PNPM_VERSION"
fi

# Install project dependencies
if [ -f "pnpm-lock.yaml" ]; then
    echo "📦 Installing project dependencies..."
    pnpm install
    echo "✅ Dependencies installed"
else
    echo "⚠️  No pnpm-lock.yaml found. Run 'pnpm install' manually."
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    $INSTALL_CMD git
else
    GIT_VERSION=$(git --version)
    echo "✅ Git installed: $GIT_VERSION"
fi

# Check if build-essential (for native modules) is installed (Debian/Ubuntu)
if [ "$PKG_MANAGER" = "apt" ]; then
    if ! dpkg -l | grep -q build-essential; then
        echo "📦 Installing build-essential (for native modules)..."
        $INSTALL_CMD build-essential
    else
        echo "✅ build-essential already installed"
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  pnpm dev    - Start development server"
echo "  pnpm build  - Build for production"
echo "  pnpm lint   - Run linter"
echo "  pnpm format - Format code"
