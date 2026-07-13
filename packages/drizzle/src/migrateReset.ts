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

/**
 * Run all migrate down functions
 */
export async function migrateReset(this: DrizzleAdapter): Promise<void> {
  const { cms } = this
  const migrationFiles = await readMigrationFiles({ cms })

  const { existingMigrations } = await getMigrations({ cms })

  if (!existingMigrations?.length) {
    cms.logger.info({ msg: 'No migrations to reset.' })
    return
  }

  const req = await createLocalReq({}, cms)

  existingMigrations.reverse()

  // Rollback all migrations in order
  for (const migration of existingMigrations) {
    const migrationFile = migrationFiles.find((m) => m.name === migration.name)
    try {
      if (!migrationFile) {
        throw new Error(`Migration ${migration.name} not found locally.`)
      }

      const start = Date.now()
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
      let msg = `Error running migration ${migrationFile.name}.`

      if (err instanceof Error) {
        msg += ` ${err.message}`
      }

      await killTransaction(req)
      cms.logger.error({
        err,
        msg,
      })
      process.exit(1)
    }
  }

  // Delete dev migration

  const tableExists = await migrationTableExists(this)
  if (tableExists) {
    try {
      await cms.delete({
        collection: 'cms-migrations',
        where: {
          batch: {
            equals: -1,
          },
        },
      })
    } catch (err: unknown) {
      cms.logger.error({ err, msg: 'Error deleting dev migration' })
    }
  }
}
