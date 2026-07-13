import { Table } from 'console-table-printer'
import { getMigrations, readMigrationFiles } from '@hanzo/cms'

import type { DrizzleAdapter } from './types.js'

import { migrationTableExists } from './utilities/migrationTableExists.js'

export async function migrateStatus(this: DrizzleAdapter): Promise<void> {
  const { cms } = this
  const migrationFiles = await readMigrationFiles({ cms })

  cms.logger.debug({
    msg: `Found ${migrationFiles.length} migration files.`,
  })

  let existingMigrations = []
  const hasMigrationTable = await migrationTableExists(this)

  if (hasMigrationTable) {
    ;({ existingMigrations } = await getMigrations({ cms }))
  }

  if (!migrationFiles.length) {
    cms.logger.info({ msg: 'No migrations found.' })
    return
  }

  // Compare migration files to existing migrations
  const statuses = migrationFiles.map((migration) => {
    const existingMigration = existingMigrations.find((m) => m.name === migration.name)
    return {
      Name: migration.name,

      Batch: existingMigration?.batch,
      Ran: existingMigration ? 'Yes' : 'No',
    }
  })

  const p = new Table()

  statuses.forEach((s) => {
    p.addRow(s, {
      color: s.Ran === 'Yes' ? 'green' : 'red',
    })
  })
  p.printTable()
}
