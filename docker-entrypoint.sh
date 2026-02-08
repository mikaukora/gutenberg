#!/usr/bin/env bash
set -euo pipefail

CATALOG_CSV="${CATALOG_CSV_PATH:-/app/data/pg_catalog.csv}"
CATALOG_URL="https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv"

if [ ! -f "$CATALOG_CSV" ]; then
  echo "Catalog not found at ${CATALOG_CSV}, downloading..."
  mkdir -p "$(dirname "$CATALOG_CSV")"
  curl -fSL --progress-bar -o "$CATALOG_CSV" "$CATALOG_URL"
  echo "Download complete."
else
  echo "Catalog found at ${CATALOG_CSV}, skipping download."
fi

exec node dist/main.js
