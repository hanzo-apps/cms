/**
 * Template for localizeStatus migration
 * Transforms version._status from single value to per-locale object
 */

export const localizeStatusTemplate = (options: {
  collectionSlug?: string
  dbType: 'mongodb' | 'postgres' | 'sqlite'
  globalSlug?: string
}): string => {
  const { collectionSlug, dbType, globalSlug } = options
  const entity = collectionSlug
    ? `collectionSlug: '${collectionSlug}'`
    : `globalSlug: '${globalSlug}'`

  if (dbType === 'mongodb') {
    return `import { MigrateUpArgs, MigrateDownArgs } from '@hanzo/cms-db-mongodb'
import { localizeStatus } from '@hanzo/cms'

export async function up({ cms, req }: MigrateUpArgs): Promise<void> {
  await localizeStatus.up({
    ${entity},
    cms,
    req,
  })
}

export async function down({ cms, req }: MigrateDownArgs): Promise<void> {
  await localizeStatus.down({
    ${entity},
    cms,
    req,
  })
}
`
  }

  // SQL databases (Postgres, SQLite)
  return `import { MigrateUpArgs, MigrateDownArgs, sql } from '@hanzo/cms-db-${dbType}'
import { localizeStatus } from '@hanzo/cms'

export async function up({ db, cms, req }: MigrateUpArgs): Promise<void> {
  await localizeStatus.up({
    ${entity},
    db,
    cms,
    req,
    sql,
  })
}

export async function down({ db, cms, req }: MigrateDownArgs): Promise<void> {
  await localizeStatus.down({
    ${entity},
    db,
    cms,
    req,
    sql,
  })
}
`
}
