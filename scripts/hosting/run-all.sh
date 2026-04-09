#!/usr/bin/env bash
# Run idempotent bootstrap steps in order.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$DIR/00-ensure-env.sh"
bash "$DIR/10-vercel-bootstrap.sh"
bash "$DIR/20-railway-bootstrap.sh"
bash "$DIR/30-print-env-commands.sh"
