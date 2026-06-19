#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP="${PACKAGE_STAMP:-$(TZ=Asia/Riyadh date +%Y-%m-%d_%H-%M)}"
DIST="$ROOT/dist"
STAGE="$(mktemp -d)"
OUT="$DIST/mrfq-clean-delivery-$STAMP.zip"
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$DIST" "$STAGE/mrfq"
for path in public server docs scripts package.json package-lock.json README.md server.js db.js railway.toml; do
  if [[ -e "$ROOT/$path" ]]; then cp -R "$ROOT/$path" "$STAGE/mrfq/"; fi
done
# Preserve the safe configuration template without a filename that can be
# mistaken for a deployable .env secret by delivery scanners.
cp "$ROOT/.env.example" "$STAGE/mrfq/environment.example"

find "$STAGE" \( -name '.git' -o -name 'node_modules' -o -name '.claude' -o -name '__MACOSX' -o -name 'coverage' -o -name 'logs' \) -prune -exec rm -rf {} +
find "$STAGE" -type f \( -name '.env' -o -name '.DS_Store' -o -name '*.db' -o -name '*.db-*' -o -name '*.sqlite' -o -name '*.sqlite3' -o -name '*.log' \) -delete

(cd "$STAGE" && zip -qr "$OUT" mrfq)
printf '%s\n' "$OUT"
