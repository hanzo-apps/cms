import type { BaseDatabaseAdapter } from '../types.js'

import { commitTransaction } from '../../utilities/commitTransaction.js'
import { createLocalReq } from '../../utilities/createLocalReq.js'
import { initTransaction } from '../../utilities/initTransaction.js'
import { killTransaction } from '../../utilities/killTransaction.js'
import { getMigrations } from './getMigrations.js'
import { readMigrationFiles } from './readMigrationFiles.js'

/**
 * Run all migration down functions before running up
 */
export async function migrateRefresh(this: BaseDatabaseAdapter) {
  const { cms } = this
  const migrationFiles = await readMigrationFiles({ cms })

  const { existingMigrations } = await getMigrations({
    cms,
  })

  const req = await createLocalReq({}, cms)

  if (existingMigrations?.length) {
    cms.logger.info({
      msg: `Rolling back all ${existingMigrations.length} migration(s).`,
    })
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
        const session = cms.db.sessions?.[await req.transactionID!]
        await migrationFile.down({ cms, req, session })
        cms.logger.info({
          msg: `Migrated down:  ${migration.name} (${Date.now() - start}ms)`,
        })
        await cms.delete({
          collection: 'cms-migrations',
          req,
          where: {
            name: {
              equals: migration.name,
            },
          },
        })
      } catch (err: unknown) {
        await killTransaction(req)
        let msg = `Error running migration ${migration.name}. Rolling back.`
        if (err instanceof Error) {
          msg += ` ${err.message}`
        }
        cms.logger.error({
          err,
          msg,
        })
        process.exit(1)
      }
    }
  } else {
    cms.logger.info({ msg: 'No migrations to rollback.' })
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
      let msg = `Error running migration ${migration.name}. Rolling back.`
      if (err instanceof Error) {
        msg += ` ${err.message}`
      }
      cms.logger.error({
        err,
        msg,
      })
      process.exit(1)
    }
  }
}
