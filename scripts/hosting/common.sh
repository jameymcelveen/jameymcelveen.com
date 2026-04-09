#!/usr/bin/env bash
# shellcheck shell=bash
# Shared helpers for hosting/*.sh — source from repo root callers.

set -euo pipefail

HOSTING_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HOSTING_ROOT/../.." && pwd)"
CONFIG_JS="$HOSTING_ROOT/read-config.mjs"

require_file() {
  if [[ ! -f "$1" ]]; then
    echo "ERROR: missing file: $1" >&2
    exit 1
  fi
}

load_hosting_env() {
  if [[ -f "$HOSTING_ROOT/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$HOSTING_ROOT/.env"
    set +a
  fi
}

cfg_get() {
  node "$CONFIG_JS" get "$1"
}

eval_cfg_exports() {
  eval "$(node "$CONFIG_JS" export-sh)"
}

ensure_repo_context() {
  cd "$REPO_ROOT"
}

command_exists() {
  command -v "$1" &>/dev/null
}
