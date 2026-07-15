import type { MigrateDownArgs, MigrateUpArgs } from '@hanzo/cms-db-sqlite'

import { sql } from '@hanzo/cms-db-sqlite'

/**
 * Enable the local (email/password) auth strategy on `users` alongside the IAM
 * bearer strategy. Adds the columns Payload's local strategy selects on every
 * user query (a missing column would break ALL user reads) plus the sessions
 * table. Written as an idempotent DELTA against the pre-existing schema (every
 * other table already exists), so it applies to the live DB — never the
 * full-schema form `migrate:create` emits from an empty baseline.
 */

const AUTH_COLUMNS: string[] = [
  '`reset_password_token` text',
  '`reset_password_expiration` text',
  '`salt` text',
  '`hash` text',
  '`login_attempts` numeric DEFAULT 0',
  '`lock_until` text',
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const col of AUTH_COLUMNS) {
    try {
      await db.run(sql.raw(`ALTER TABLE \`users\` ADD COLUMN ${col};`))
    } catch (err) {
      // idempotent: re-running over an already-migrated DB is a no-op
      if (!/duplicate column name/i.test(err instanceof Error ? err.message : String(err))) {
        throw err
      }
    }
  }

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`users_sessions\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`created_at\` text,
	\`expires_at\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`users_sessions\`;`)
  // SQLite < 3.35 cannot DROP COLUMN; the added auth columns are nullable and
  // inert once the local strategy is disabled again, so they are left in place.
}
