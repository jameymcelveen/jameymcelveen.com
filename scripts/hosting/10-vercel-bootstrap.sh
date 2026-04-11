#!/usr/bin/env bash
# Idempotent: link this repo to Vercel project (name from config.yaml). Does not deploy.

set -euo pipefail

# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

load_hosting_env
eval_cfg_exports
ensure_repo_context

if ! command_exists vercel; then
  echo "Install Vercel CLI: pnpm add -g vercel   (or npm i -g vercel)" >&2
  exit 1
fi

echo "Vercel identity:"
vercel whoami

if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  export VERCEL_ORG_ID="${VERCEL_ORG_ID:-}"
  export VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-}"
fi

if [[ -f .vercel/project.json ]]; then
  echo "OK: .vercel/project.json exists (already linked)."
  echo "    Project: $VERCEL_PROJECT_NAME"
else
  echo "Linking directory to Vercel project \"$VERCEL_PROJECT_NAME\" ..."
  vercel link --yes --project "$VERCEL_PROJECT_NAME"
fi

echo ""
echo "Next (manual in dashboard or CLI):"
echo "  • Domains: add jameymcelveen.com, www, jamey.co, www as per DNS docs."
echo "  • Production env vars (see scripts/hosting/.env.example):"
echo "      INTERVIEW_API_PROXY_ORIGIN=https://<.NET-service>.up.railway.app (required on Vercel; build-time rewrite target)"
echo "      STATS_API_KEY=(match Railway STATS_API_KEY)"
echo "  • Deploy: vercel --prod   (or git push if Git integration is on)."
