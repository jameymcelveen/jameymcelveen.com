#!/usr/bin/env bash
# Deploy the Interview API from backend/ (requires: railway link completed once in that directory).
# Uses: railway up --ci (build logs, then exit; override with RAILWAY_UP_EXTRA_ARGS e.g. "--detach").

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
  echo "Install Railway CLI first (see scripts/hosting/README.md)" >&2
  exit 1
fi

cd "$BACKEND"

if ! railway status &>/dev/null; then
  echo "ERROR: This directory is not linked to a Railway project yet." >&2
  echo "" >&2
  echo "Run once from $BACKEND:" >&2
  echo "  railway login" >&2
  echo "  railway init    # create or select project \"$RAILWAY_PROJECT_NAME\"" >&2
  echo "  railway link    # pick environment + the API service (Dockerfile root = backend)" >&2
  echo "" >&2
  echo "Then re-run: bash scripts/hosting/40-railway-deploy.sh" >&2
  exit 1
fi

echo "Deploying from $BACKEND (project: $RAILWAY_PROJECT_NAME) ..."
EXTRA=(--ci)
if [[ -n "${RAILWAY_UP_EXTRA_ARGS:-}" ]]; then
  # shellcheck disable=SC2206
  EXTRA=(${RAILWAY_UP_EXTRA_ARGS})
fi

railway up "${EXTRA[@]}"

echo "OK: railway up finished. Check the Railway dashboard for the running deployment and logs."
