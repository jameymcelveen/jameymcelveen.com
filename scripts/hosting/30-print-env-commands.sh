#!/usr/bin/env bash
# Print copy-paste CLI snippets to set env vars (after editing scripts/hosting/.env).

set -euo pipefail

# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

ENV_FILE="$HOSTING_ROOT/.env"
eval_cfg_exports

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Run: bash scripts/hosting/00-ensure-env.sh"
  exit 1
fi

echo "# Load values from $ENV_FILE (export them in your shell) then run:"
echo ""
echo "# --- Vercel (production) ---"
echo "grep -v '^#' scripts/hosting/.env | grep -v '^$' | while IFS= read -r line; do"
echo "  k=\${line%%=*}; v=\${line#*=}"
echo "  printf '%s' \"\$v\" | vercel env add \"\$k\" production"
echo "done"
echo ""
echo "# Or set manually in Vercel → Settings → Environment Variables:"
echo "#   NEXT_PUBLIC_API_URL=$API_PUBLIC_BASE_URL"
echo "#   INTERVIEW_API_URL=$API_PUBLIC_BASE_URL"
echo "#   STATS_API_KEY=<same as API>"
echo ""
echo "# --- Railway (variables for Interview API service) ---"
echo "cd backend && railway variables --set \"GEMINI_API_KEY=\$GEMINI_API_KEY\" ..."
echo "# Prefer Railway dashboard → Variables for GEMINI_API_KEY, STATS_API_KEY, connection string, etc."
echo ""
echo "# --- Deploy API (after railway link in backend/) ---"
echo "bash scripts/hosting/40-railway-deploy.sh"
