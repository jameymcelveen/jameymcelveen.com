# <img src="./public/clemson-tigers-logo.svg" alt="Clemson Tiger" width="32" height="32" style="vertical-align: middle;" /> Jamey McElveen - Portfolio Site

<div align="center">

## 👋 Welcome to My Portfolio

**Live Site:** [jameymcelveen.com](https://jameymcelveen.com) | [Vercel Preview](https://jameymcelveen-com.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com)

**Built with [Cursor](https://cursor.sh) AI** 🤖

</div>

---

## ✨ Features

- 🎨 **Modern Design** - Dark theme with Clemson-inspired color palette
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Performance** - Next.js 16 with App Router and Turbopack
- 🔒 **Protected Content** - PIN-protected cover letter templates
- 🖨️ **Print-Optimized** - Clean resume printing with `@media print` styles
- 🎭 **Animations** - Smooth Framer Motion animations throughout
- 🔐 **Privacy** - Obfuscated contact information to prevent scraping

## 🎯 Build Your Own Portfolio

**Like this site? Build your own!**

This portfolio is fully data-driven and comes with a scaffold generator to create your own portfolio site in minutes. All content is managed through a single `profile.json` file—no code changes needed.

### Quick Start

```bash
# Use the scaffold generator
npx create-portfolio-site
# or
cd scaffold && npm install && node bin/create-portfolio-site.js
```

The generator will:
- ✅ Create a complete Next.js project structure
- ✅ Set up all components and pages
- ✅ Pre-fill your basic information
- ✅ Configure domain redirects
- ✅ Get you ready to customize

**📖 [View Scaffold Documentation →](./scaffold/README.md)**

All you need to do is:
1. Run the generator
2. Update `src/data/profile.json` with your information
3. Add your photo and assets
4. Deploy!

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Package Manager:** pnpm
- **Deployment:** Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (managed via `.nvmrc`)
- pnpm (will be installed by setup script)

### Setup

Run the automated setup script:

```bash
# Mac/Linux
make setup

# Windows
.\setup.bat
```

Or manually:

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## 📜 Available Scripts

```bash
pnpm dev          # Start development server (Turbopack)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
```

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Home page
│   │   ├── resume/       # Resume page
│   │   └── cover-letters/ # Cover letter templates
│   ├── components/        # React components
│   └── globals.css        # Global styles
├── public/                # Static assets
├── tools/                 # AI cover letter generation tools
├── docs/                  # Documentation
└── Makefile              # Build automation (Mac/Linux)
```

## 🔧 Development

### Code Quality

- **ESLint** - Linting with Next.js config
- **Prettier** - Code formatting with Tailwind plugin
- **EditorConfig** - Consistent editor settings
- **TypeScript** - Full type safety

### Node Version

This project uses Node.js 22 (specified in `.nvmrc`). If you use `nvm`, it will automatically switch:

```bash
nvm use  # Automatically uses Node 22
```

## 📚 Documentation

- [GoDaddy to Vercel Setup Guide](./docs/godaddy-to-vercel.md) - How to point your domain to Vercel
- [Cover Letter Generation Tools](./tools/COVER_LETTER_GENERATION.md) - AI-powered cover letter generation
- [Session Notes](./.cursor/session-notes.md) - AI agent continuity and project context

## 🎨 Design System

### Colors

- **Primary Accent:** Purple (`#8b6cb5`)
- **Secondary:** Clemson Regalia (`#522d80`)
- **Highlights:** Clemson Orange (`#f56600`) - used sparingly
- **Background:** Dark purple-tinted (`#0c0a10`)

### Typography

- **Sans:** Geist Sans (via Next.js)
- **Mono:** Geist Mono (for code/tech terms)

## 🚢 Deployment

This site is automatically deployed to Vercel on every push to `main`.

Use **pnpm** for installs (`pnpm install`). The repo tracks **`pnpm-lock.yaml`** only; **`package-lock.json` is ignored** so CI/Vercel `frozen-lockfile` installs never drift. Running `npm install` is blocked via **`preinstall`**—use pnpm (Corepack: `corepack enable`).

- **Production:** https://jameymcelveen.com
- **Preview:** https://jameymcelveen-com.vercel.app

See [docs/godaddy-to-vercel.md](./docs/godaddy-to-vercel.md) for domain setup instructions.

## 📝 License

Private project - All rights reserved.

---

<div align="center">

**© 2026 Jamey McElveen. All rights reserved.**

[Portfolio](https://jameymcelveen.com) • [GitHub](https://github.com/jameymcelveen/jameymcelveen.com) • [Email](mailto:jamey@mcelveen.us)

</div>
