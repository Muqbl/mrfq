#!/usr/bin/env bash
set -euo pipefail

for name in DB_PATH BACKUP_DIR RESTORE_DRILL_DIR; do
  if [[ -z "${!name:-}" ]]; then
    printf 'ERROR: %s is required for an isolated restore drill.\n' "$name" >&2
    exit 2
  fi
done

DB_PATH_ABS="$(cd "$(dirname "$DB_PATH")" 2>/dev/null && pwd)/$(basename "$DB_PATH")"
mkdir -p "$BACKUP_DIR" "$RESTORE_DRILL_DIR"
BACKUP_DIR_ABS="$(cd "$BACKUP_DIR" && pwd)"
DRILL_DIR_ABS="$(cd "$RESTORE_DRILL_DIR" && pwd)"

if [[ "$DRILL_DIR_ABS" == "$(dirname "$DB_PATH_ABS")" ]]; then
  printf '%s\n' 'ERROR: RESTORE_DRILL_DIR must be separate from the live database directory.' >&2
  exit 3
fi

LATEST="$(find "$BACKUP_DIR_ABS" -maxdepth 1 -type f -name 'mrfq-*.db' -print | sort | tail -n 1)"
if [[ -z "$LATEST" || ! -f "$LATEST" ]]; then
  printf 'ERROR: no mrfq-*.db backup found in %s\n' "$BACKUP_DIR_ABS" >&2
  exit 4
fi

STAMP="$(TZ=Asia/Riyadh date +%Y-%m-%d_%H-%M-%S)"
TARGET="$DRILL_DIR_ABS/mrfq-restore-drill-$STAMP.db"
cp "$LATEST" "$TARGET"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
node - "$TARGET" <<'NODE'
const Database = require('better-sqlite3');
const target = process.argv[2];
const db = new Database(target, { readonly: true, fileMustExist: true });
const integrity = db.pragma('integrity_check', { simple: true });
const tables = db.prepare("SELECT count(*) AS count FROM sqlite_master WHERE type='table'").get().count;
db.close();
if (integrity !== 'ok') throw new Error(`restore integrity_check failed: ${integrity}`);
if (!tables) throw new Error('restore contains no database tables');
process.stdout.write(`${JSON.stringify({ target, integrity, tables })}\n`);
NODE

printf 'RESTORE_DRILL_OK backup=%s restored=%s\n' "$LATEST" "$TARGET"
