# Hosting automation (Vercel + Railway)

Scripts here are **idempotent** where the CLIs allow it: safe to run more than once. They read **`config.yaml`** (committed) and optional **`./.env`** (you create from **`.env.example`**, gitignored).

## Prereqs

- Node **22+** (repo standard) and **pnpm** — `read-config.mjs` uses the `yaml` devDependency.
- **Vercel CLI**: `pnpm add -g vercel` (or `npm i -g vercel`).
- **Railway CLI**: see [Railway CLI](https://docs.railway.app/develop/cli) (`brew install railway` or `npm i -g @railway/cli`).
- Bash (macOS/Linux) or **Git Bash / WSL** on Windows.

## Config

| File | Purpose |
|------|---------|
| `config.yaml` | Project slug `jameymcelveen`, domains (`jameymcelveen.com`, `jamey.co`), API base `https://api.jameymcelveen.com`. |
| `.env.example` | Template for env vars to mirror on Vercel and Railway. |
| `.env` | Your real values — **not committed**. Created by `00-ensure-env.sh`. |

## Strategy

- **Vercel** hosts the Next.js site as project **`jameymcelveen`**.
- **Railway** hosts the .NET Interview API; use service **root directory `backend`** and **`backend/Dockerfile`**.
- Public API URL **`https://api.jameymcelveen.com`** (subdomain) keeps **`NEXT_PUBLIC_API_URL`** / CORS straightforward. Putting the API under `jameymcelveen.com/api` would require Vercel rewrites to the Railway origin and URL changes in the app — not pre-wired here.

## Commands

From **repository root**:

```bash
# 1) Create scripts/hosting/.env from .env.example if missing
bash scripts/hosting/00-ensure-env.sh

# 2) Link repo to Vercel project jameymcelveen (creates .vercel/project.json)
bash scripts/hosting/10-vercel-bootstrap.sh

# 3) Check Railway CLI and print backend link / dashboard checklist
bash scripts/hosting/20-railway-bootstrap.sh

# 4) Print reminders for env var setup
bash scripts/hosting/30-print-env-commands.sh

# Or all steps in order:
bash scripts/hosting/run-all.sh
```

pnpm shortcuts:

```bash
pnpm run hosting:env
pnpm run hosting:vercel
pnpm run hosting:railway
pnpm run hosting:print-env
pnpm run hosting:bootstrap
pnpm run hosting:railway-deploy   # uploads & deploys API (needs railway link in backend/)
```

### Deploy the API to Railway

Bootstrap scripts **do not** deploy. After **`cd backend && railway link`** succeeds:

```bash
bash scripts/hosting/40-railway-deploy.sh
```

This runs **`railway up --ci`** (build logs, then exit). To fire-and-forget:

```bash
RAILWAY_UP_EXTRA_ARGS='--detach' bash scripts/hosting/40-railway-deploy.sh
```

## After bootstrap

1. **DNS** (registrar): point apex/`www` for both domains to Vercel per their DNS UI; add **`api.jameymcelveen.com`** as a **CNAME** (or A/ALIAS) to Railway’s target for the API service.
2. **Vercel** → project → Domains: attach `jameymcelveen.com`, `www.jameymcelveen.com`, `jamey.co`, `www.jamey.co`.
3. **Vercel** env (production): `NEXT_PUBLIC_API_URL`, `INTERVIEW_API_URL`, `STATS_API_KEY` (match API).
4. **Railway** env: `GEMINI_API_KEY`, `STATS_API_KEY`, SQLite path via volume + `ConnectionStrings__DefaultConnection`, `ASPNETCORE_ENVIRONMENT=Production`.
5. **CORS** on the API includes both sites — see `backend/appsettings.json` (`Cors:Origins`); adjust if you add more hosts.

## Tokens and CI

For non-interactive Vercel use, set **`VERCEL_TOKEN`** (and optionally org/project IDs) in **`scripts/hosting/.env`**.

### Railway from GitHub Actions

Pushing to **`main`** does **not** deploy Railway by default. You can either:

1. **GitHub Action (this repo)** — workflow **`.github/workflows/railway-api.yml`** runs on **`backend/**`** changes. Add an Actions secret **`RAILWAY_TOKEN`**: in Railway open the **project** → **project settings** → **Tokens** → create a **project token** scoped to the environment where the API runs (e.g. Production). If the project has **multiple services**, also set **`RAILWAY_SERVICE_NAME`** to the exact API service name. You can re-run the workflow manually from the **Actions** tab (**Deploy API (Railway)**).
2. **Railway ↔ GitHub in the dashboard** — connect the same GitHub repo to the API service and enable **deploy on push** (Railway builds from git; no `RAILWAY_TOKEN` in GitHub). If you use this, you can disable or delete the workflow above to avoid double deploys.

Local deploys still use **`railway login`** + **`bash scripts/hosting/40-railway-deploy.sh`** (see [Project tokens](https://docs.railway.com/integrations/api#project-token) for non-interactive **`RAILWAY_TOKEN`**).
