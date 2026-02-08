# ── Stage 1: Build frontend ─────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build backend ──────────────────────────
FROM node:22-alpine AS backend-build
WORKDIR /build
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ── Stage 3: Production image ───────────────────────
FROM node:22-alpine
RUN apk add --no-cache curl bash
WORKDIR /app

# Install production dependencies only
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Copy built backend
COPY --from=backend-build /build/dist ./dist

# Copy built frontend into backend's public directory
COPY --from=frontend-build /build/dist ./public

# Copy entrypoint script
COPY docker-entrypoint.sh ./

ENV NODE_ENV=production
ENV PORT=3000
ENV CATALOG_CSV_PATH=/app/data/pg_catalog.csv

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
