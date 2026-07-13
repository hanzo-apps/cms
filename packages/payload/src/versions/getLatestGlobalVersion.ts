import type { SanitizedGlobalConfig } from '../globals/config/types.js'
import type { Document, CMS, CMSRequest, Where } from '../types/index.js'
import type { TypeWithVersion } from './types.js'

import { hasDraftsEnabled } from '../utilities/getVersionsConfig.js'

type Args = {
  config: SanitizedGlobalConfig
  locale?: string
  cms: CMS
  published?: boolean
  req?: CMSRequest
  slug: string
  where: Where
}

export const getLatestGlobalVersion = async ({
  slug,
  config,
  locale,
  cms,
  published,
  req,
  where,
}: Args): Promise<{ global: Document; globalExists: boolean }> => {
  let latestVersion: TypeWithVersion<Document> | undefined

  const whereQuery = published
    ? { 'version._status': { equals: 'published' } }
    : { latest: { equals: true } }

  if (hasDraftsEnabled(config)) {
    latestVersion = (
      await cms.db.findGlobalVersions({
        global: slug,
        limit: 1,
        locale: locale || req?.locale || undefined,
        pagination: false,
        req,
        where: whereQuery as unknown as Where,
      })
    ).docs[0]
  }

  const global = await cms.db.findGlobal({
    slug,
    locale,
    req,
    where,
  })
  const globalExists = Boolean(global)

  if (!latestVersion) {
    return {
      global,
      globalExists,
    }
  }

  if (!latestVersion.version.createdAt) {
    latestVersion.version.createdAt = latestVersion.createdAt
  }

  if (!latestVersion.version.updatedAt) {
    latestVersion.version.updatedAt = latestVersion.updatedAt
  }

  return {
    global: latestVersion.version,
    globalExists,
  }
}
