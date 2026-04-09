#!/usr/bin/env bash
# Copy .env.example -> .env if missing (secrets stay local / gitignored).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EX="$ROOT/.env.example"
ENV="$ROOT/.env"

require_file() {
  if [[ ! -f "$1" ]]; then
    echo "ERROR: missing $1" >&2
    exit 1
  fi
}

require_file "$EX"

if [[ -f "$ENV" ]]; then
  echo "OK: $ENV already exists"
  exit 0
fi

cp "$EX" "$ENV"
chmod 600 "$ENV" 2>/dev/null || true
echo "Created $ENV from .env.example — edit it with your tokens before syncing env to hosts."
