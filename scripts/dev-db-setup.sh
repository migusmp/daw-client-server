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

: "${MARIADB_ROOT_PASSWORD:?Missing MARIADB_ROOT_PASSWORD in .env}"
: "${MARIADB_DATABASE:?Missing MARIADB_DATABASE in .env}"

if [[ "${DB_HOST:-}" != "127.0.0.1" && "${DB_HOST:-}" != "localhost" ]]; then
  echo "Warning: DB_HOST is '${DB_HOST:-}'. For dev it should be 127.0.0.1."
fi

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.dev.yml"

cd "$ROOT_DIR"

echo "Starting MariaDB..."
$COMPOSE up -d db

echo "Waiting for MariaDB to accept connections..."
ready=0
for i in {1..30}; do
  if docker exec -i daw-db mariadb -uroot -p"${MARIADB_ROOT_PASSWORD}" -e "SELECT 1;" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done

if [[ "$ready" -ne 1 ]]; then
  echo "MariaDB did not become ready. Check logs with:"
  echo "  $COMPOSE logs db --tail 100"
  exit 1
fi

echo "Applying schema..."
docker exec -i daw-db mariadb -uroot -p"${MARIADB_ROOT_PASSWORD}" "${MARIADB_DATABASE}" < "$ROOT_DIR/docker/mariadb/init/01_schema.sql"

if [[ -f "$ROOT_DIR/docker/mariadb/init/02_seed.sql" ]]; then
  echo "Applying seed..."
  docker exec -i daw-db mariadb -uroot -p"${MARIADB_ROOT_PASSWORD}" "${MARIADB_DATABASE}" < "$ROOT_DIR/docker/mariadb/init/02_seed.sql"
fi

echo "Done."
echo "Start PHP server with:"
echo "  php -S localhost:8000 -t public public/index.php"
