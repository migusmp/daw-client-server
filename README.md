# daw-client-server
Full client-server web application built with vanilla PHP and JavaScript, focusing on core web fundamentals, backend architecture, and real-world client-server communication.

## Docker (MariaDB)

- Copy `.env.example` to `.env` and adjust credentials.
- Database:
  - `docker compose up -d db`
  - (Dev) expose port 3306: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db`
- Init scripts (first boot only): `docker/mariadb/init/01_schema.sql`, `docker/mariadb/init/02_seed.sql`
- (Optional) PHP+Apache app at `http://localhost:8080/`:
  - `docker compose --profile app up -d --build`

## Dev Mode (PHP local + DB in Docker)

1. Start MariaDB with exposed port:
   - `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db`
2. Set `.env` for local PHP:
   - `DB_HOST=127.0.0.1`
   - `DB_PORT=3306`
3. Run PHP built-in server:
   - `php -S localhost:8000 -t public public/index.php`

## Scripts

- `scripts/dev-db-setup.sh`: Starts MariaDB in dev mode (port 3306), waits for readiness, applies `01_schema.sql` and `02_seed.sql` if present.
- `scripts/docker-stack-up.sh`: Starts DB + Apache app containers using Docker Compose profile `app`.
- `scripts/db-reset-and-seed.sh`: Drops volumes, recreates DB, and reapplies schema/seed.

## Schema Reset (re-run init scripts)

MariaDB init scripts only run on the first boot of an empty volume. To force a reset:

- Full reset + schema apply:
  - `./scripts/db-reset-and-seed.sh`

If you prefer manual schema apply without dropping volumes:

- `docker exec -i daw-db mariadb -uroot -p<MARIADB_ROOT_PASSWORD> cityhalldb < docker/mariadb/init/01_schema.sql`
