import type { FindVersions, SanitizedCollectionConfig } from '@hanzo/cms'

import { buildVersionCollectionFields } from '@hanzo/cms'
import toSnakeCase from 'to-snake-case'

import type { DrizzleAdapter } from './types.js'

import { findMany } from './find/findMany.js'

export const findVersions: FindVersions = async function findVersions(
  this: DrizzleAdapter,
  { collection, limit, locale, page, pagination, req, select, sort: sortArg, where },
) {
  const collectionConfig: SanitizedCollectionConfig = this.cms.collections[collection].config
  const sort = sortArg !== undefined && sortArg !== null ? sortArg : collectionConfig.defaultSort

  const tableName = this.tableNameMap.get(
    `_${toSnakeCase(collectionConfig.slug)}${this.versionsSuffix}`,
  )

  const fields = buildVersionCollectionFields(this.cms.config, collectionConfig, true)

  return findMany({
    adapter: this,
    fields,
    joins: false,
    limit,
    locale,
    page,
    pagination,
    req,
    select,
    sort,
    tableName,
    where,
  })
}
