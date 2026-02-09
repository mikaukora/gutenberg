# Gutenberg Catalog Browser

A web application for browsing the [Project Gutenberg](https://www.gutenberg.org/) book catalog. Built with NestJS and React.

## Features

- Browse ~77,000 books from the Project Gutenberg catalog
- Filter by language (120 languages available)
- Full-text search across titles, authors, subjects, and bookshelves
- Paginated results sorted by publication date
- Direct links to books on gutenberg.org

## Prerequisites

- Node.js 18+
- npm

## Getting Started

### 1. Fetch the catalog data

```bash
./fetch_books.sh
```

This downloads the full `pg_catalog.csv` from Project Gutenberg (updated weekly). To also extract entries for a specific language into `pg_catalog_<code>.csv`, pass the language code:

```bash
./fetch_books.sh fi    # full catalog + pg_catalog_fi.csv
./fetch_books.sh en    # full catalog + pg_catalog_en.csv
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Start the backend

```bash
cd backend
npm run start:dev
```

The API server starts on http://localhost:3001. On startup it parses the full CSV catalog into memory.

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/languages` | List all unique language codes |
| `GET /api/books` | Paginated book listing |

### Query parameters for `/api/books`

| Parameter | Description | Default |
|---|---|---|
| `language` | Filter by language code (e.g. `fi`, `en`) | all |
| `search` | Search titles, authors, subjects, bookshelves | none |
| `page` | Page number | `1` |
| `limit` | Results per page | `50` |

## Project Structure

```
gutenberg-info/
  fetch_books.sh           # Script to download catalog CSV (optional: language code for filtered copy)
  backend/                 # NestJS API server
    src/
      catalog/
        book.interface.ts
        catalog.service.ts
        catalog.controller.ts
        catalog.module.ts
  frontend/                # React + Vite UI
    src/
      api.ts
      App.tsx
      components/
        BookTable.tsx
        LanguageFilter.tsx
        Pagination.tsx
        SearchBar.tsx
```

## Docker / Coolify Deployment

Build and run as a single container:

```bash
docker build -t gutenberg-browser .
docker run --rm -p 3000:3000 gutenberg-browser
```

Use `--rm` so the container is removed when it stops; Ctrl+C will shut the app down and release the port. The container automatically downloads the catalog CSV on first startup. The data is stored at `/app/data/pg_catalog.csv` inside the container. To persist it across restarts, mount a volume:

```bash
docker run --rm -p 3000:3000 -v gutenberg-data:/app/data gutenberg-browser
```

In Coolify, point it at this repository and it will pick up the `Dockerfile` automatically. Optionally add a volume mount for `/app/data` to persist the catalog across redeployments.

## Daily refresh

The catalog can be refreshed automatically on a schedule so new books from Project Gutenberg are picked up without redeploying.

- **CATALOG_REFRESH_CRON** — Cron expression for when to download the new CSV and reload (default: `0 2 * * *`, i.e. 02:00 UTC daily). Set to empty to disable the scheduled refresh.
- **REFRESH_SECRET** — If set, enables the external trigger endpoint and requires this value in the `X-Refresh-Secret` header. If not set, the admin endpoint is disabled.

**External trigger (optional):** When `REFRESH_SECRET` is set, you can trigger a refresh on demand:

```bash
curl -X POST https://your-app/api/admin/refresh-catalog \
  -H "X-Refresh-Secret: your-secret"
```

Returns `200 { "ok": true }` on success. Without the correct header, returns 401.

## Production

For production deployments:

- **NODE_ENV** — Set to `production` so CORS and security headers use production settings.
- **CORS_ORIGIN** — Comma-separated list of allowed frontend origins (e.g. `https://catalog.example.com`). Required in production; no default (no `*`).
- **REFRESH_SECRET** — Use a strong secret (e.g. 32+ random bytes). Do not commit it; set it in the environment or a secrets manager. The admin endpoint uses constant-time comparison and is rate-limited (5 requests per minute per IP).
- **THROTTLE_TTL** / **THROTTLE_LIMIT** — Optional. Global rate limit: `THROTTLE_LIMIT` requests per `THROTTLE_TTL` ms (default: 100 per 60000 ms). Tune if needed.
- **Security** — The backend sets Helmet security headers, validates and clamps `page` (≥1) and `limit` (1–100) for `/api/books`, and rate-limits all routes. Run behind a reverse proxy (nginx, Caddy, etc.) for TLS and optional additional rate limiting.

## Data Source

The catalog CSV is published weekly by Project Gutenberg at:
https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv
