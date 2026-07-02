import type { DynamicMigrationTemplate } from '@hanzo/cms'

import { buildDynamicPredefinedBlocksToJsonMigration } from '@hanzo/cms-drizzle'

export const dynamic: DynamicMigrationTemplate = buildDynamicPredefinedBlocksToJsonMigration({
  packageName: '@hanzo/cms-db-vercel-postgres',
})
