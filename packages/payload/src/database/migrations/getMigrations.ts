import type { CMS } from '../../index.js'
import type { MigrationData } from '../types.js'

/**
 * Gets all existing migrations from the database, excluding the dev migration
 */
export async function getMigrations({
  cms,
}: {
  cms: CMS
}): Promise<{ existingMigrations: MigrationData[]; latestBatch: number }> {
  const migrationQuery = await cms.find({
    collection: 'cms-migrations',
    limit: 0,
    sort: ['-batch', '-name'],
    where: {
      batch: {
        not_equals: -1,
      },
    },
  })

  const existingMigrations = migrationQuery.docs as unknown as MigrationData[]

  // Get the highest batch number from existing migrations
  const latestBatch = Number(existingMigrations?.[0]?.batch) || 0

  return {
    existingMigrations,
    latestBatch,
  }
}
