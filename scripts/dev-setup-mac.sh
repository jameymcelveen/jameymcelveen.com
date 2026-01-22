#!/bin/bash
# macOS Development Setup Script
# Idempotent - safe to run multiple times

set -e

echo "🍎 macOS Development Setup"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing via Homebrew..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "📦 Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    echo "📦 Installing Node.js via Homebrew..."
    brew install node
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
    echo "⚠️  Git not found. Install Xcode Command Line Tools:"
    echo "   xcode-select --install"
else
    GIT_VERSION=$(git --version)
    echo "✅ Git installed: $GIT_VERSION"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  pnpm dev    - Start development server"
echo "  pnpm build  - Build for production"
echo "  pnpm lint   - Run linter"
echo "  pnpm format - Format code"
