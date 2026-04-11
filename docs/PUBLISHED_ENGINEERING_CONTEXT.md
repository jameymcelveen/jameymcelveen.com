# Published engineering context — jameymcelveen.com

This document is a **technical snapshot** of how the personal site and interview API are built, deployed, and wired together. It is meant for **publication** (blog appendix, repo docs, onboarding). **Secrets are omitted** — only variable *names* and patterns are listed.

**Last updated:** 2026-04-10 (synthesized from implementation and deployment work)

---

## 1. High-level architecture

| Layer | Role |
|--------|------|
| **Vercel** | Next.js 16 app — marketing site, resume, `/ai` chat UI, **rewrite** of same-origin `/api/*` to the Interview API |
| **Railway** | ASP.NET Core **Interview.Api** (`.NET 9`) — Gemini chat, analytics ingestion, stats, OpenAPI/Scalar |
| **DNS** | Apex/`www` → Vercel. Optional `api.*` → Railway if you want a direct API hostname (not required for the site). |

The browser talks to **`https://jameymcelveen.com/api/...`** only. Next.js **`rewrites()`** in `next.config.ts` forward those requests to Railway, preserving path (`/api/:path*` → `{upstream}/api/:path*`), query string, and headers through the platform proxy.

---

## 2. Frontend (Next.js)

- **Framework:** Next.js **16.1**, React 19, App Router, Turbopack in dev.
- **Styling:** Tailwind CSS v4, tokens in `src/app/globals.css` (`@theme`, CSS variables).
- **Design language:** “Engineering Command Center” — dark baseline inspired by Linear-style product UI; separate **Claude-like** full-page UI for `/ai` (see `globals.css` `.ai-chat-shell` and `InterviewConsole.tsx`).
- **Fonts:** Geist Sans / Mono, JetBrains Mono (see `src/app/layout.tsx`).
- **Important routes:** `/`, `/resume`, `/resume/print`, `/cover-letters` (PIN-gated UI), `/ai` (unlisted chat — no main nav link), `/stats` (stats dashboard, server-side fetch + env).
- **API calls:** Client and server use **relative** `/api/...` (same origin). No `NEXT_PUBLIC_API_URL`.

Key files:

- `src/app/layout.tsx` — root shell, `PageChrome` for layout width, `Navigation`, `GradientMesh`, analytics.
- `src/components/PageChrome.tsx` — `/ai` is full-bleed; other pages use `max-w-4xl`.
- `src/components/Navigation.tsx` — hidden on `/ai`.
- `src/components/GradientMesh.tsx` — hidden on `/ai`.
- `src/components/InterviewConsole.tsx` — chat UX, remark-gfm markdown, light/dark theme toggle, streaming display of assistant text.
- `src/lib/site-analytics.ts` — visitor/session keys for analytics API.
- `src/data/profile.json` — content + site domain (canonical apex vs `www` for redirects).

---

## 3. API routing (`next.config.ts` rewrites)

**Behavior:** `source: '/api/:path*'` → `destination: '{upstream}/api/:path*'`. The backend serves `/api/chat`, `/api/stats`, `/api/analytics/*`, etc., so **`/api/` appears on both sides**.

**Default upstream** is the production Railway URL committed in `next.config.ts`. **`INTERVIEW_API_PROXY_ORIGIN`** (optional, no `NEXT_PUBLIC_` prefix) overrides that value when present; it is read when the config is evaluated (**build time** on Vercel). Local **Docker Compose** sets it to `http://api:8080` so the dev server rewrites to the compose `api` service.

Do not add a catch-all **`app/api`** Route Handler for the same paths — it would take precedence over rewrites and break the proxy.

---

## 4. Backend (Interview.Api)

- **Project:** `backend/Interview.Api.csproj`, **.NET 9**, minimal APIs.
- **Docker:** `backend/Dockerfile`; Railway should use **`backend`** as service root in a monorepo.
- **Features:** `POST /api/chat` (Gemini + system prompt from `backend/Prompts/system_prompt.md`), analytics routes, `GET /api/stats` (API key), `GET /health`, OpenAPI + Scalar at `/` when deployed.
- **Packages:** EF Core SQLite, Google Generative AI SDK, `Microsoft.AspNetCore.OpenApi`, `Scalar.AspNetCore`.
- **CORS:** Configured in `backend/appsettings.json` (`Cors:Origins`) for the real site origins.
- **Forwarded headers:** Used so Railway sees correct scheme/client IP behind proxies.

---

## 5. Environment variables (names only)

**Vercel (production)**

| Variable | Purpose |
|----------|---------|
| `STATS_API_KEY` | Must match API `Stats:ApiKey` / `STATS_API_KEY` for `/stats` |
| `INTERVIEW_API_PROXY_ORIGIN` | Optional; overrides default rewrite upstream (build-time) |

**Railway (API service)**

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Gemini |
| `STATS_API_KEY` | Protects `GET /api/stats` |
| `PORT` | Set by Railway |
| `ConnectionStrings__DefaultConnection` | SQLite path (often under `/app/data` with a volume) |
| `OpenApi__PublicBaseUrl` | Optional OpenAPI “servers” URL for Scalar/Try-it |
| `Gemini:*`, `Stats:*`, `Cors:*` | See `appsettings.json` |

Local and scripting templates: `scripts/hosting/.env.example`, repo `.env.example` for compose.

---

## 6. Deploy and CI

- **Vercel:** Connect GitHub repo; production branch `main`; set env vars; redeploy after proxy-related changes.
- **Railway:** Dockerfile deploy from `backend/`; GitHub Action `.github/workflows/railway-api.yml` runs `railway up --ci --path-as-root ./backend` on `backend/**` changes — requires **`RAILWAY_TOKEN`** (and optionally **`RAILWAY_SERVICE_NAME`**) in GitHub Secrets.
- **Manual Railway deploy:** `bash scripts/hosting/40-railway-deploy.sh` after `railway link` in `backend/`.

Details: `scripts/hosting/README.md`, `scripts/hosting/config.yaml`.

---

## 7. Domains and redirects (lessons learned)

- **Apex vs `www`:** Vercel primary domain and `next.config` **host redirects** must agree. Opposing rules ⇒ `ERR_TOO_MANY_REDIRECTS` (e.g. Vercel apex→`www` while Next forced `www`→apex). Pick one canonical pattern and match both places.
- **`api` subdomain on Railway:** DNS `api` must target the **.NET** service’s Railway URL. If that hostname is attached to a **Next.js** (or wrong) Railway service, the “API” URL will serve the wrong app — check **which service** owns the custom domain / default `*.up.railway.app` URL.
- **Custom `api` domain is optional** if all traffic uses **`jameymcelveen.com/api/*`** via the Next.js rewrite.

---

## 8. Content and security (non-secret patterns)

- **Cover letters:** PIN gate in `PinGate.tsx`; unlocked state in `sessionStorage` — do not commit real PINs to public docs.
- **Interview route:** `/ai` is intentionally unlisted in main navigation; metadata may set `robots: noindex`.
- **Stats:** Hidden dashboard; requires matching API key server-side.

---

## 9. Dependency highlights

From `package.json`: `next`, `react`, `react-markdown`, `remark-gfm`, `framer-motion`, `lucide-react`, `recharts` (stats UI). Backend: see `Interview.Api.csproj`.

---

## 10. Further reading in-repo

- `scripts/hosting/README.md` — bootstrap, Vercel/Railway env, DNS checklist  
- `docs/godaddy-to-vercel.md` — registrar notes (if present)  
- `backend/railway.toml` — Railway build hints  
- `.github/workflows/railway-api.yml` — API deploy workflow  

---

## 11. Changelog mindset (for future you)

When publishing updates to this file after major changes:

- Proxy behavior and env names (§5, §3).  
- Canonical domain/Vercel settings (§7).  
- New routes or feature flags.  
- Bump “Last updated” date.

---

*End of published context. This is not a substitute for reading `README` and source; it ties deployment and architecture together for readers outside the repo.*
