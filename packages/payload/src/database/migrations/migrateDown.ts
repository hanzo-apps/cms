import type { BaseDatabaseAdapter } from '../types.js'

import { commitTransaction } from '../../utilities/commitTransaction.js'
import { createLocalReq } from '../../utilities/createLocalReq.js'
import { initTransaction } from '../../utilities/initTransaction.js'
import { killTransaction } from '../../utilities/killTransaction.js'
import { getMigrations } from './getMigrations.js'
import { readMigrationFiles } from './readMigrationFiles.js'

export async function migrateDown(this: BaseDatabaseAdapter): Promise<void> {
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
      const session = cms.db.sessions?.[await req.transactionID!]
      await migrationFile.down({ cms, req, session })
      cms.logger.info({
        msg: `Migrated down:  ${migrationFile.name} (${Date.now() - start}ms)`,
      })
      // Waiting for implementation here
      await cms.delete({
        id: migration.id!,
        collection: 'cms-migrations',
        req,
      })

      await commitTransaction(req)
    } catch (err: unknown) {
      await killTransaction(req)
      cms.logger.error({
        err,
        msg: `Error running migration ${migrationFile.name}`,
      })
      process.exit(1)
    }
  }
}
