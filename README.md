# Verify System

Full-stack exam result verification platform with an Express/PostgreSQL backend and a Next.js frontend.

## Dockerized Setup

1. **Configure environment**
   - Copy `exam-result-system-backend/env.example` to `exam-result-system-backend/.env` and fill real secrets (`DATABASE_URL`, `JWT_SECRET`, etc.).
   - Copy `my-frontend/env.example` to `my-frontend/.env` and set `NEXT_PUBLIC_API_URL` if different from the default internal URL.
   - `docker compose` still reads from the example files by default, so edit them or update the compose file to point at your copies.

2. **Build and start**
   ```bash
   docker compose up --build
   ```
   - Backend available at `http://localhost:5000` (Swagger at `/api-docs`).
   - Frontend available at `http://localhost:3000`.

3. **Persistent uploads**
   - `docker-compose.yml` mounts a `backend_uploads` volume to `/app/uploads` so certificate PDFs survive container restarts.

4. **Database migrations/seed**
   - With containers running: `docker compose exec backend npm run db:init`.
   - Seed admin: `docker compose exec backend npm run seed:admin`.

5. **Stop containers**
   ```bash
   docker compose down
   ```

Adjust the compose file if you need additional services (e.g., a managed Postgres instance or external storage).
