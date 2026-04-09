#!/usr/bin/env bash
# Idempotent checks + guidance for Railway. Full link may be interactive (railway login).

set -euo pipefail

# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

load_hosting_env
eval_cfg_exports
ensure_repo_context

SR="$(cfg_get railway.service_root)"
BACKEND="$REPO_ROOT/$SR"

if [[ ! -d "$BACKEND" ]]; then
  echo "ERROR: backend path not found: $BACKEND" >&2
  exit 1
fi

if ! command_exists railway; then
  echo "Install Railway CLI: https://docs.railway.app/develop/cli" >&2
  echo "  macOS/Homebrew: brew install railway  (or npm i -g @railway/cli)" >&2
  exit 1
fi

echo "Railway CLI:"
railway --version

echo ""
echo "Project name (from config): $RAILWAY_PROJECT_NAME"
echo "Service root: $BACKEND"
echo ""
echo "If this machine is not linked yet, from $BACKEND run:"
echo "  cd $BACKEND"
echo "  railway login"
echo "  railway init    # create or attach to project \"$RAILWAY_PROJECT_NAME\""
echo "  railway link    # select the project/service when prompted"
echo ""
echo "In Railway dashboard for the API service:"
echo "  • Root Directory: $SR"
echo "  • Use backend/Dockerfile (see backend/railway.toml)"
echo "  • Add a volume mount for SQLite, e.g. mount -> /app/data, and set:"
echo "      ConnectionStrings__DefaultConnection=Data Source=/app/data/analytics.db"
echo "  • Custom domain: $API_PUBLIC_BASE_URL (hostname $(cfg_get api.suggested_hostname))"
echo "  • Env: GEMINI_API_KEY, STATS_API_KEY, ASPNETCORE_ENVIRONMENT=Production"
echo ""

cd "$BACKEND"
if railway whoami &>/dev/null; then
  echo "OK: railway whoami succeeded (CLI logged in)."
else
  echo "NOTE: run 'railway login' from this machine, then railway init/link from backend/."
fi

echo ""
if railway status &>/dev/null; then
  echo "OK: backend/ is linked to Railway (railway status)."
  echo "    To deploy the API: bash scripts/hosting/40-railway-deploy.sh"
else
  echo "NOTE: backend/ is NOT linked yet — nothing can deploy until you run railway link here:"
  echo "      cd $BACKEND && railway init && railway link"
  echo "    Then: bash scripts/hosting/40-railway-deploy.sh"
fi
