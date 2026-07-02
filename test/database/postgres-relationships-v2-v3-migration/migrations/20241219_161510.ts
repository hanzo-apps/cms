import type { MigrateDownArgs, MigrateUpArgs } from '@hanzo/cms-db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Migration code
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Migration code
}
