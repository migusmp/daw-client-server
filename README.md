# daw-client-server
Full client-server web application built with vanilla PHP and JavaScript, focusing on core web fundamentals, backend architecture, and real-world client-server communication.

Aplicación web cliente-servidor desarrollada desde cero con PHP y JavaScript puro, centrada en arquitectura, comunicación HTTP y buenas prácticas.

## Docker (MariaDB)

- Copia `.env.example` a `.env` y ajusta credenciales.
- Base de datos:
  - `docker compose up -d db`
  - (Dev) exponer el puerto 3306: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db`
- (Opcional) app PHP+Apache en `http://localhost:8080/`:
  - `docker compose --profile app up -d --build`
