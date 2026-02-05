#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ ! -f "$ROOT_DIR/.env" ]]; then
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  echo "Created .env from .env.example. Please review credentials."
fi

set -a
source "$ROOT_DIR/.env"
set +a

if [[ "${DB_HOST:-}" != "db" ]]; then
  echo "Warning: DB_HOST is '${DB_HOST:-}'. For Apache container it should be 'db'."
fi

cd "$ROOT_DIR"

echo "Starting DB + Apache app containers..."
docker compose --profile app up -d --build

echo "Done."
echo "App URL: http://localhost:8080/"
