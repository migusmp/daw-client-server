#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

set -a
source "$ROOT_DIR/.env"
set +a

: "${MARIADB_ROOT_PASSWORD:?Missing MARIADB_ROOT_PASSWORD in .env}"
: "${MARIADB_DATABASE:?Missing MARIADB_DATABASE in .env}"

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.dev.yml"

cd "$ROOT_DIR"

echo "Stopping containers and removing volumes..."
$COMPOSE down -v --remove-orphans

echo "Starting MariaDB..."
$COMPOSE up -d db

echo "Waiting for MariaDB to accept connections..."
for i in {1..30}; do
  if docker exec -i daw-db mariadb -uroot -p"${MARIADB_ROOT_PASSWORD}" -e "SELECT 1;" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "Applying schema..."
docker exec -i daw-db mariadb -uroot -p"${MARIADB_ROOT_PASSWORD}" "${MARIADB_DATABASE}" < "$ROOT_DIR/docker/mariadb/init/01_schema.sql"

echo "Done."
