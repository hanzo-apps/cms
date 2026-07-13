import { commitTransaction, initTransaction, killTransaction, readMigrationFiles } from '@hanzo/cms'
import prompts from 'prompts'

import type { MongooseAdapter } from './index.js'

/**
 * Drop the current database and run all migrate up functions
 */
export async function migrateFresh(
  this: MongooseAdapter,
  { forceAcceptWarning = false }: { forceAcceptWarning?: boolean },
): Promise<void> {
  const { cms } = this

  if (!forceAcceptWarning) {
    const { confirm: acceptWarning } = await prompts(
      {
        name: 'confirm',
        type: 'confirm',
        initial: false,
        message: `WARNING: This will drop your database and run all migrations. Are you sure you want to proceed?`,
      },
      {
        onCancel: () => {
          process.exit(0)
        },
      },
    )

    if (!acceptWarning) {
      process.exit(0)
    }
  }

  cms.logger.info({
    msg: `Dropping database.`,
  })

  await this.connection.dropDatabase()

  const migrationFiles = await readMigrationFiles({ cms })
  cms.logger.debug({
    msg: `Found ${migrationFiles.length} migration files.`,
  })

  const req = { cms }

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
          batch: 1,
        },
        req,
      })

      await commitTransaction(req)

      cms.logger.info({ msg: `Migrated:  ${migration.name} (${Date.now() - start}ms)` })
    } catch (err: unknown) {
      await killTransaction(req)
      cms.logger.error({
        err,
        msg: `Error running migration ${migration.name}. Rolling back.`,
      })
      throw err
    }
  }
}
