import type { BaseDatabaseAdapter } from '../types.js'

import { commitTransaction } from '../../utilities/commitTransaction.js'
import { createLocalReq } from '../../utilities/createLocalReq.js'
import { initTransaction } from '../../utilities/initTransaction.js'
import { killTransaction } from '../../utilities/killTransaction.js'
import { getMigrations } from './getMigrations.js'
import { readMigrationFiles } from './readMigrationFiles.js'

export async function migrateReset(this: BaseDatabaseAdapter): Promise<void> {
  const { cms } = this
  const migrationFiles = await readMigrationFiles({ cms })

  const { existingMigrations } = await getMigrations({ cms })

  if (!existingMigrations?.length) {
    cms.logger.info({ msg: 'No migrations to reset.' })
    return
  }

  const req = await createLocalReq({}, cms)

  migrationFiles.reverse()

  // Rollback all migrations in order
  for (const migration of migrationFiles) {
    // Create or update migration in database
    const existingMigration = existingMigrations.find(
      (existing) => existing.name === migration.name,
    )
    if (existingMigration) {
      cms.logger.info({ msg: `Migrating down: ${migration.name}` })
      try {
        const start = Date.now()
        await initTransaction(req)
        const session = cms.db.sessions?.[await req.transactionID!]
        await migration.down({ cms, req, session })
        await cms.delete({
          collection: 'cms-migrations',
          req,
          where: {
            id: {
              equals: existingMigration.id,
            },
          },
        })
        await commitTransaction(req)
        cms.logger.info({ msg: `Migrated down:  ${migration.name} (${Date.now() - start}ms)` })
      } catch (err: unknown) {
        await killTransaction(req)
        cms.logger.error({ err, msg: `Error running migration ${migration.name}` })
        throw err
      }
    }
  }

  // Delete dev migration
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
