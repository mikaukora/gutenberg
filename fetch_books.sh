#!/usr/bin/env bash
#
# Fetches the Project Gutenberg catalog (full CSV).
# Optional: pass a language code (e.g. fi, en) to also extract entries for that language.
# Source: https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv
#

set -euo pipefail

CATALOG_URL="https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv"
FULL_CATALOG="pg_catalog.csv"

echo "Downloading Project Gutenberg catalog..."
curl -fSL --progress-bar -o "$FULL_CATALOG" "$CATALOG_URL"

FULL_LINES=$(tail -n +2 "$FULL_CATALOG" | wc -l | tr -d ' ')
echo "Done! Downloaded ${FULL_LINES} entries to ${FULL_CATALOG}"

if [ $# -ge 1 ]; then
  LANG="$1"
  FILTERED_CATALOG="pg_catalog_${LANG}.csv"

  echo "Extracting ${LANG} language entries..."

  head -n 1 "$FULL_CATALOG" > "$FILTERED_CATALOG"

  LANG_COL=$(head -n 1 "$FULL_CATALOG" | tr ',' '\n' | grep -n '^Language$' | cut -d: -f1)

  if [ -z "$LANG_COL" ]; then
    echo "Error: Could not find 'Language' column in the catalog."
    exit 1
  fi

  awk -F',' -v col="$LANG_COL" -v lang="$LANG" 'NR > 1 && $col == lang' "$FULL_CATALOG" >> "$FILTERED_CATALOG"

  TOTAL=$(tail -n +2 "$FILTERED_CATALOG" | wc -l | tr -d ' ')
  echo "Extracted ${TOTAL} ${LANG} entries to ${FILTERED_CATALOG}"
fi
