import fs from 'fs'
import path from 'path'

import type { CMS } from '../../index.js'
import type { Migration } from '../types.js'

import { dynamicImport } from '../../utilities/dynamicImport.js'

/**
 * Read the migration files from disk
 */
export const readMigrationFiles = async ({
  cms,
}: {
  cms: CMS
}): Promise<Migration[]> => {
  if (!fs.existsSync(cms.db.migrationDir)) {
    cms.logger.error({
      msg: `No migration directory found at ${cms.db.migrationDir}`,
    })
    return []
  }

  cms.logger.info({
    msg: `Reading migration files from ${cms.db.migrationDir}`,
  })

  const files = fs
    .readdirSync(cms.db.migrationDir)
    .sort()
    .filter((f) => {
      return (f.endsWith('.ts') || f.endsWith('.js')) && f !== 'index.js' && f !== 'index.ts'
    })
    .map((file) => {
      return path.resolve(cms.db.migrationDir, file)
    })

  return Promise.all(
    files.map(async (filePath) => {
      const migrationModule = await dynamicImport<
        | {
            default: Migration
          }
        | Migration
      >(filePath)
      const migration = 'default' in migrationModule ? migrationModule.default : migrationModule

      const result: Migration = {
        name: path.basename(filePath).split('.')[0]!,
        down: migration.down,
        up: migration.up,
      }

      return result
    }),
  )
}
