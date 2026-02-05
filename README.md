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
