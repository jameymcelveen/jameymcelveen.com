# Portfolio Site - Session Notes

**Last Updated:** 2026-01-20  
**Project:** jameymcelveen.com - Personal Portfolio Site

---

## 🎯 Project Overview

A modern, professional portfolio site built with Next.js 16, TypeScript, and Tailwind CSS. Features a dark theme with Clemson-inspired color palette, AI-augmented cover letter generation tools, and print-optimized resume.

**Live Site:** https://jameymcelveen.com  
**GitHub:** https://github.com/jameymcelveen/jameymcelveen.com  
**Vercel Preview:** https://jameymcelveen-com.vercel.app

---

## 🎨 Design Decisions

### Color Palette
- **Primary Accent:** Purple `#8b6cb5` (soft, professional)
- **Secondary:** Clemson Regalia `#522d80`
- **Highlights:** Clemson Orange `#f56600` (used sparingly for emphasis)
- **Background:** Dark purple-tinted `#0c0a10`

### Typography
- **Sans:** Geist Sans (via Next.js)
- **Mono:** Geist Mono (for code/tech terms)

### Visual Effects
- **Gradient Mesh:** Subtle animated background with orange hint
- **Liquid Glass:** Enhanced glassmorphism on resume cards (single pass on load, then on hover)
- **No Shimmer:** Removed from text and buttons (looked bad)
- **Animations:** Framer Motion for smooth transitions

---

## 📁 Key Files & Structure

```
src/
├── app/
│   ├── page.tsx              # Home page with photo, kinetic typography
│   ├── resume/page.tsx        # Resume with bento grid layout
│   ├── cover-letters/page.tsx # PIN-protected cover letter templates
│   └── globals.css            # Design system, print styles
├── components/
│   ├── Navigation.tsx         # Top nav (hides cover letters until unlocked)
│   ├── PinGate.tsx            # PIN protection (072995)
│   ├── ObfuscatedContact.tsx  # Email/phone obfuscation
│   └── GradientMesh.tsx       # Animated background
public/
├── jamey-mcelveen.jpg         # 150x150px photo (face centered)
└── clemson-tigers-logo.svg    # Clemson logo (used subtly)
tools/                         # AI cover letter generation scripts
docs/                          # Documentation (GoDaddy setup, etc.)
```

---

## 🔐 Security & Privacy

### PIN Protection
- **Cover Letters PIN:** `072995`
- Stored in `src/components/PinGate.tsx`
- Uses sessionStorage (clears on browser close)
- Lock icon always visible (can hide/show cover letters button)

### Contact Obfuscation
- Email/phone base64 encoded in `ObfuscatedContact.tsx`
- Decoded client-side with delay to prevent scraping
- Values: `amFtZXlAbWNlbHZlZW4udXM=` (email), `KDg0MykgNjE4LTgwNzg=` (phone)

---

## 🎯 Current Features

### Home Page
- Professional photo (150x150px, centered, round)
- Kinetic typography on name
- Tech stack badges
- Obfuscated contact info
- GitHub link (https://github.com/jameymcelveen/jameymcelveen.com)
- Cursor acknowledgment
- Subtle Clemson logo (bottom-left, 50% opacity)
- Secret lock icon (bottom-right) for cover letters access

### Resume Page
- Bento grid layout
- Liquid glass effect on cards (single pass on load, then on hover)
- Print-optimized styles
- References section (print-only)
- Clemson logo replaces emoji in education section (web only, hidden in print)

### Cover Letters Page
- PIN-protected (072995)
- 4 industry templates (Christian Tech, FinTech, Healthcare, General)
- Copy to clipboard functionality
- Hidden from navigation until unlocked

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Package Manager:** pnpm
- **Node Version:** 22 (via .nvmrc)
- **Deployment:** Vercel

---

## 📝 Important Context

### Domain
- **Website:** jameymcelveen.com (all references updated)
- **Email Domain:** mcelveen.us (different from website - keep as is)
- **GitHub Repo:** jameymcelveen/jameymcelveen.com

### Photo
- **File:** `/public/jamey-mcelveen.jpg`
- **Size:** 150x150px
- **Position:** `objectPosition: 'center center'` (face centered in square)
- **Display:** Round, 128px/160px responsive

### Clemson Branding
- Logo used subtly (50% opacity on home page)
- Replaces emoji in resume education section
- Hidden in print styles
- Clemson Orange used sparingly for highlights only

### Print Styles
- Clean black/white output
- Hidden: nav, buttons, gradients, lock icons, logos
- References section appears only in print
- Proper margins and page breaks

---

## 🚀 Development Workflow

### Setup
```bash
# Mac/Linux
make setup

# Windows
.\setup.bat
```

### Common Commands
```bash
pnpm dev          # Development server (Turbopack)
pnpm build        # Production build
pnpm format       # Format code
pnpm lint         # Run linter
```

### Node Version
- Managed via `.nvmrc` (Node 22)
- Auto-switches when using nvm

---

## 📋 TODO / Future Enhancements

- [ ] Add projects section (mentioned as future possibility)
- [ ] Consider adding blog (user said "not yet")
- [ ] Fine-tune photo positioning if needed
- [ ] Monitor Vercel deployment after domain setup

---

## 🔄 Session Continuity Rules

**For Future AI Agents:**

1. **Read this file first** - Contains all context needed to continue
2. **Update this file** - When making significant changes or decisions
3. **Preserve design decisions** - Don't change color palette or core design without user approval
4. **Maintain security** - Keep PIN protection and obfuscation intact
5. **Respect print styles** - Always test print output when making resume changes
6. **Follow existing patterns** - Use same component structure and naming conventions

---

## 📚 Key Documentation

- **Domain Setup:** `docs/godaddy-to-vercel.md`
- **Cover Letter Tools:** `tools/COVER_LETTER_GENERATION.md`
- **Resume Context:** `tools/RESUME_CONTEXT.md`
- **Style Guide:** `tools/COVER_LETTER_STYLE.md`

---

## 🎨 Design Philosophy

- **Subtle over flashy** - Professional, not gimmicky
- **Clemson colors as accent** - Not dominant, just hints
- **Mobile-first** - Responsive at all breakpoints
- **Performance** - Static generation, optimized images
- **Accessibility** - Proper ARIA labels, semantic HTML

---

## ⚠️ Important Notes

- **Email domain ≠ Website domain** - `mcelveen.us` vs `jameymcelveen.com`
- **PIN is 072995** - Change in `PinGate.tsx` if needed
- **Photo is 150x150px** - Face centered, round display
- **No shimmer on text/buttons** - Removed because it looked bad
- **Print styles are critical** - Test before deploying resume changes

---

**Last Session Focus:** Removed shimmer effects, updated Clemson logo placement, fixed domain references, added photo and GitHub link.
