import type { DynamicMigrationTemplate } from @hanzo/cms'from 

import { buildDynamicPredefinedBlocksToJsonMigration } from '@hanzo/cms-drizzle'

export const dynamic: DynamicMigrationTemplate = buildDynamicPredefinedBlocksToJsonMigration({
  packageName: '@hanzo/cms-db-d1-sqlite',
})
