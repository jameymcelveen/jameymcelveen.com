# Portfolio Site - Session Notes

**Last Updated:** 2026-06-02 (Bill → Claude Haiku)  
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

---

## Garfield session — 2026-06-02 (Ask Jamey / Bill chat fix)

**Version / tag:** `v1.4.3` (package `1.4.3`)

**Shipped (Homer story — answer breadth + no trailing suggestions):**
- `career-validator.ts`: safety-only (empty, length, injection snippets, blocked topics). Removed `CAREER_HINTS` / `INTERVIEW_SHAPE` hard reject.
- `system-prompt.md`: removed Rule 8 (Hand-off), stripped all KB `FOLLOW_UP` lines, added Rule 10 (stop when complete — no trailing questions). Rule 9 = expansion logic without suggestion hand-off.
- `AskJameyChatPanel.tsx`: starter chips already gated on `userMessageCount === 0` (no code change).

**Verify:** `POST /api/chat` with "Would Jamey be a good fit for an early-stage startup?" → 200 streamed answer (not canned rejection). Injection / NSFW → 400.

**Also on main (prior Garfield):** gunmetal glass UI (`v1.4.2`), `scripts/seed-analytics-events.mjs` + `pnpm run db:seed` for dashboard demo data.

**PO / ops:** Run `DATABASE_URL=... pnpm run db:seed -- --reset` locally if dashboard should show seed traffic.

**Build:** `pnpm run build` passes. `pnpm run lint` has pre-existing react-hooks errors (dashboard, Background) — not introduced by this story.

---

## Garfield session — 2026-06-02 (Gemini 2.5 Flash + caching decision)

**Version / tag:** `v1.4.4` (package `1.4.4`)

**Shipped:**
- Default chat model `gemini-2.5-flash` via `resolveGeminiModel()`; legacy `gemini-2.0-flash` env aliases upgraded.
- Cost estimator: `GEMINI_25_FLASH_COST` ($0.30 / $2.50 per 1M in/out), `GEMINI_25_FLASH_LITE_COST` ($0.10 / $0.40) when model id contains `flash-lite`.
- Analytics `logChatTurn` uses resolved model + matching rates.

**Context caching (deliberate decision — NOT explicit):**
- System prompt ≈ **5,325 tokens** (21.4 KB markdown) — **above** Gemini 2.5 Flash **1,024-token** minimum ([caching docs](https://ai.google.dev/gemini-api/docs/caching)).
- **Implicit caching** applies automatically on 2.5+ (same `systemInstruction` prefix every call).
- **Explicit `CachedContent` not wired:** `@google/generative-ai` SDK has no cache API; portfolio/serverless traffic does not justify REST cache lifecycle + TTL storage vs implicit hits. Revisit if traffic grows or SDK migrates to `@google/genai`.

---

## Garfield session — 2026-06-02 (job-hunt project content refresh)

**Version / tag:** `v1.4.5` (package `1.4.5`)

**Shipped (Homer — stack accuracy + Azure):**
- `profile.json`: QikLog → .NET 9 / Blazor Server / SignalR / PostgreSQL / Redis / **Azure Container Apps** / Zitadel; Christ Medical → Dapper+Npgsql / Next.js 15 PWA / IndexedDB offline (no Dotmim); home summary + skills surface Azure; resume CM bullet updated.
- `system-prompt.md`: new **QIKLOG** KB module; **CHRIST_MEDICAL** updated (IndexedDB PWA, no Dotmim); tone/guardrail routing for QikLog/Azure questions.

**Verify:** Bill answers "What is QikLog built on?" with .NET 9 + Azure Container Apps stack (fresh dev server smoke test).

---

## Garfield session — 2026-06-02 (Bill: Gemini → Claude Haiku)

**Version / tag:** `v1.4.6` (package `1.4.6`)

**Shipped:**
- Replaced `@google/generative-ai` with `@anthropic-ai/sdk`; deleted `gemini.ts`; new `claude.ts`.
- Model: `claude-haiku-4-5` (`ANTHROPIC_MODEL` override). `max_tokens` 1024, temperature 0.65.
- **Prompt caching:** system prompt block uses `cache_control: { type: 'ephemeral' }` (~5.3k tokens, above 4,096 min for Haiku 4.5).
- Cost estimator: `CLAUDE_HAIKU_45_COST` — $1/1M in, $5/1M out, $0.10/1M cache read, $1.25/1M cache write (5m).
- Stats dashboard: `gemini` → `llm` in analytics payload; UI labels "Bill / Claude".
- Env/docs: `ANTHROPIC_API_KEY` only; all `GEMINI_*` references removed from repo.

**Railway/Vercel:** Set `ANTHROPIC_API_KEY` in deployment env (Jamey reports already on Railway). Remove obsolete `GEMINI_API_KEY` from hosting dashboards.
