#!/bin/bash

# Script to copy template files from parent directory to scaffold/template

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$SCRIPT_DIR/template"

echo "Copying template files..."

# Create template directory structure
mkdir -p "$TEMPLATE_DIR/src/app"
mkdir -p "$TEMPLATE_DIR/src/components"
mkdir -p "$TEMPLATE_DIR/src/data"
mkdir -p "$TEMPLATE_DIR/public"
mkdir -p "$TEMPLATE_DIR/tools"

# Copy source files
cp -r "$PARENT_DIR/src/app"/* "$TEMPLATE_DIR/src/app/"
cp -r "$PARENT_DIR/src/components"/* "$TEMPLATE_DIR/src/components/"
cp -r "$PARENT_DIR/src/data"/* "$TEMPLATE_DIR/src/data/"

# Copy config files
cp "$PARENT_DIR/next.config.ts" "$TEMPLATE_DIR/"
cp "$PARENT_DIR/tsconfig.json" "$TEMPLATE_DIR/"
cp "$PARENT_DIR/postcss.config.mjs" "$TEMPLATE_DIR/"
cp "$PARENT_DIR/eslint.config.mjs" "$TEMPLATE_DIR/"

# Copy public assets (excluding personal photos)
cp "$PARENT_DIR/public"/*.svg "$TEMPLATE_DIR/public/" 2>/dev/null || true
cp "$PARENT_DIR/public/favicon.ico" "$TEMPLATE_DIR/public/" 2>/dev/null || true
cp "$PARENT_DIR/public/icon.svg" "$TEMPLATE_DIR/public/" 2>/dev/null || true

# Copy tools directory
cp -r "$PARENT_DIR/tools"/* "$TEMPLATE_DIR/tools/" 2>/dev/null || true

# Create template package.json
cat > "$TEMPLATE_DIR/package.json" << 'EOF'
{
  "name": "portfolio-site",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "dependencies": {
    "framer-motion": "^12.27.5",
    "lucide-react": "^0.562.0",
    "next": "16.1.4",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.4",
    "prettier": "^3.8.0",
    "prettier-plugin-tailwindcss": "^0.7.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
EOF

# Create README template
cat > "$TEMPLATE_DIR/README.md" << 'EOF'
# Portfolio Site

A modern, data-driven portfolio site built with Next.js.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

2. Update your information in `src/data/profile.json`

3. Add your photo to `public/` directory and update the path in `profile.json`

4. Run the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

All content is driven by `src/data/profile.json`. Update this file to customize:
- Personal information
- Work experience
- Skills
- Cover letter templates
- Branding colors
- Domain configuration

## Deployment

This site can be deployed to Vercel, Netlify, or any platform that supports Next.js.

See [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
EOF

echo "✅ Template files copied successfully!"
