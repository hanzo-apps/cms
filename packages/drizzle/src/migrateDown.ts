import {
  commitTransaction,
  createLocalReq,
  getMigrations,
  initTransaction,
  killTransaction,
  readMigrationFiles,
} from '@hanzo/cms'

import type { DrizzleAdapter } from './types.js'

import { getTransaction } from './utilities/getTransaction.js'
import { migrationTableExists } from './utilities/migrationTableExists.js'
import { parseError } from './utilities/parseError.js'

export async function migrateDown(this: DrizzleAdapter): Promise<void> {
  const { cms } = this
  const migrationFiles = await readMigrationFiles({ cms })

  const { existingMigrations, latestBatch } = await getMigrations({
    cms,
  })

  if (!existingMigrations?.length) {
    cms.logger.info({ msg: 'No migrations to rollback.' })
    return
  }

  cms.logger.info({
    msg: `Rolling back batch ${latestBatch} consisting of ${existingMigrations.length} migration(s).`,
  })

  const latestBatchMigrations = existingMigrations.filter(({ batch }) => batch === latestBatch)

  for (const migration of latestBatchMigrations) {
    const migrationFile = migrationFiles.find((m) => m.name === migration.name)
    if (!migrationFile) {
      throw new Error(`Migration ${migration.name} not found locally.`)
    }

    const start = Date.now()
    const req = await createLocalReq({}, cms)

    try {
      cms.logger.info({ msg: `Migrating down: ${migrationFile.name}` })
      await initTransaction(req)
      const db = await getTransaction(this, req)
      await migrationFile.down({ db, cms, req })
      cms.logger.info({
        msg: `Migrated down:  ${migrationFile.name} (${Date.now() - start}ms)`,
      })

      const tableExists = await migrationTableExists(this, db)

      if (tableExists) {
        await cms.delete({
          id: migration.id,
          collection: 'cms-migrations',
          req,
        })
      }

      await commitTransaction(req)
    } catch (err: unknown) {
      await killTransaction(req)

      cms.logger.error({
        err,
        msg: parseError(err, `Error migrating down ${migrationFile.name}. Rolling back.`),
      })
      process.exit(1)
    }
  }
}
