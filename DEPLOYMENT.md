# Wefyx deployment

## Local development (Windows)

Run both services in separate terminals from the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\backend\start-local.ps1
```

```powershell
npm --prefix web run dev
```

Open `http://localhost:5173`. Keep the backend terminal running: Vite forwards `/api` to `http://127.0.0.1:8080`, and a stopped backend causes HTTP 502. Check `http://localhost:5173/api/bookings/catalog` to verify the connection. The backend uses the existing persistent local database by default; environment variables override settings in `backend/src/main/resources/application.yml`.

## Docker Compose

1. Install Docker Engine and Docker Compose on the server.
2. Copy this project to the server.
3. Copy `.env.example` to `.env` and replace every example secret and domain.
4. Run `docker compose up -d --build` from the `wefyx-project` directory.
5. Point the domain to the server and terminate HTTPS with the server load balancer or reverse proxy.

The web container serves the React SPA and proxies `/api` to the backend. PostgreSQL data is retained in the `wefyx_postgres` volume. Set `SEED_DATA=true` only for the first demo deployment; change it to `false` afterward.

## Required production values

- `DATABASE_PASSWORD`: unique database password.
- `ADMIN_PASSWORD`: strong initial administrator password.
- `JWT_SECRET`: at least 32 cryptographically random characters.
- `PUBLIC_URL`: exact HTTPS web application origin, without a trailing slash.

## Operations

- Logs: `docker compose logs -f`
- Status: `docker compose ps`
- Rebuild: `docker compose up -d --build`
- Stop: `docker compose down`
- Stop and delete database: `docker compose down -v` (destructive)
