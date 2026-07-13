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

/**
 * Run all migration down functions before running up
 */
export async function migrateRefresh(this: DrizzleAdapter) {
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

  const req = await createLocalReq({}, cms)

  // Reverse order of migrations to rollback
  existingMigrations.reverse()

  for (const migration of existingMigrations) {
    try {
      const migrationFile = migrationFiles.find((m) => m.name === migration.name)
      if (!migrationFile) {
        throw new Error(`Migration ${migration.name} not found locally.`)
      }

      cms.logger.info({ msg: `Migrating down: ${migration.name}` })
      const start = Date.now()
      await initTransaction(req)
      const db = await getTransaction(this, req)
      await migrationFile.down({ db, cms, req })
      cms.logger.info({
        msg: `Migrated down:  ${migration.name} (${Date.now() - start}ms)`,
      })

      const tableExists = await migrationTableExists(this, db)
      if (tableExists) {
        await cms.delete({
          collection: 'cms-migrations',
          req,
          where: {
            name: {
              equals: migration.name,
            },
          },
        })
      }
      await commitTransaction(req)
    } catch (err: unknown) {
      await killTransaction(req)
      cms.logger.error({
        err,
        msg: parseError(err, `Error running migration ${migration.name}. Rolling back.`),
      })
      process.exit(1)
    }
  }

  // Run all migrate up
  for (const migration of migrationFiles) {
    cms.logger.info({ msg: `Migrating: ${migration.name}` })
    try {
      const start = Date.now()
      await initTransaction(req)
      await migration.up({ cms, req })
      await cms.create({
        collection: 'cms-migrations',
        data: {
          name: migration.name,
          executed: true,
        },
        req,
      })
      await commitTransaction(req)

      cms.logger.info({ msg: `Migrated:  ${migration.name} (${Date.now() - start}ms)` })
    } catch (err: unknown) {
      await killTransaction(req)
      cms.logger.error({
        err,
        msg: parseError(err, `Error running migration ${migration.name}. Rolling back.`),
      })
      process.exit(1)
    }
  }
}
