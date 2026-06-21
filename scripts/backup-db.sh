#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DB_PATH:-}" ]]; then
  printf '%s\n' 'ERROR: DB_PATH must point to the persistent MRFQ SQLite database.' >&2
  exit 2
fi

if [[ ! -f "$DB_PATH" ]]; then
  printf 'ERROR: database not found at %s\n' "$DB_PATH" >&2
  exit 3
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
export BACKUP_RETENTION="${BACKUP_RETENTION:-14}"

exec node "$ROOT/scripts/backup-db.js"
