#!/usr/bin/env bash
#
# Fetches the Project Gutenberg catalog and extracts Finnish language entries.
# Source: https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv
#

set -euo pipefail

CATALOG_URL="https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv"
FULL_CATALOG="pg_catalog.csv"
FINNISH_CATALOG="pg_catalog_fi.csv"

echo "Downloading Project Gutenberg catalog..."
curl -fSL --progress-bar -o "$FULL_CATALOG" "$CATALOG_URL"

echo "Extracting Finnish language entries..."

# Extract the header line, then filter rows where the Language column equals "fi".
# The CSV uses commas as delimiters. We need to find which column is "Language".
head -n 1 "$FULL_CATALOG" > "$FINNISH_CATALOG"

# Identify the Language column index (1-based)
LANG_COL=$(head -n 1 "$FULL_CATALOG" | tr ',' '\n' | grep -n '^Language$' | cut -d: -f1)

if [ -z "$LANG_COL" ]; then
  echo "Error: Could not find 'Language' column in the catalog."
  exit 1
fi

echo "Language column is #${LANG_COL}"

# Filter rows where the Language field is "fi".
# Using awk to properly handle the CSV (fields are comma-separated).
awk -F',' -v col="$LANG_COL" 'NR > 1 && $col == "fi"' "$FULL_CATALOG" >> "$FINNISH_CATALOG"

TOTAL=$(tail -n +2 "$FINNISH_CATALOG" | wc -l | tr -d ' ')
echo "Done! Found ${TOTAL} Finnish entries in ${FINNISH_CATALOG}"
