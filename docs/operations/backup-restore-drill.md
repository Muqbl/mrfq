# Backup and Restore Drill

Date: 2026-06-21

## Commands

Backup:

```sh
DB_PATH=/persistent/mrfq.db \
BACKUP_DIR=/separate-backup-volume/mrfq \
BACKUP_RETENTION=14 \
scripts/backup-db.sh
```

Isolated restore drill:

```sh
DB_PATH=/persistent/mrfq.db \
BACKUP_DIR=/separate-backup-volume/mrfq \
RESTORE_DRILL_DIR=/isolated-restore-work/mrfq \
scripts/restore-db-drill.sh
```

Both scripts reject missing variables. The restore script refuses to use the live database directory, selects the newest generated backup, copies it under a timestamped drill filename, opens it read-only, runs SQLite `integrity_check`, and verifies that tables exist. It never replaces `DB_PATH`.

## Expected result

- Backup exits 0 and prints the snapshot path.
- Restore exits 0, reports `integrity: ok`, reports a non-zero table count, and prints `RESTORE_DRILL_OK`.
- A production-grade drill must additionally boot the matching clean release against the isolated restored database/uploads and verify representative authenticated workflows and RPO/RTO.

## Last drill

- Date: 2026-06-21
- Status: completed locally on an isolated temporary SQLite database and temporary backup/restore directories.
- Production/off-host restore status: pending.
- Reason: no production-like persistent volumes, correlated uploads snapshot, monitoring platform, or approved production dataset are available in this environment.

## Rollback notes

- Preserve the failed release, logs, database and uploads before action.
- Do not overwrite production automatically.
- Restore only after incident authorization, checksum/source verification, compatibility review, and traffic isolation.
- Keep the last verified clean package available and validate health, authentication, bootstrap, all operational modules, photos and reports before reopening traffic.

The local drill validates tooling safety and SQLite readability. It does not approve unsupervised production restoration.
