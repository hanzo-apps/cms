import type { SanitizedCollectionConfig } from '../collections/config/types.js'
import type { DeleteVersionsArgs } from '../database/types.js'
import type { SanitizedGlobalConfig } from '../globals/config/types.js'
import type { CMS, CMSRequest, Where } from '../types/index.js'

type Args = {
  collection?: SanitizedCollectionConfig
  global?: SanitizedGlobalConfig
  id?: number | string
  max: number
  cms: CMS
  req?: CMSRequest
}

export const enforceMaxVersions = async ({
  id,
  collection,
  global: globalConfig,
  max,
  cms,
  req,
}: Args): Promise<void> => {
  const entityType = collection ? 'collection' : 'global'
  const slug = collection ? collection.slug : globalConfig?.slug

  try {
    const where: Where = {}
    let oldestAllowedDoc

    if (collection) {
      where.parent = {
        equals: id,
      }

      const query = await cms.db.findVersions({
        collection: collection.slug,
        limit: 1,
        page: max + 1,
        pagination: false,
        req,
        sort: '-updatedAt',
        where,
      })

      ;[oldestAllowedDoc] = query.docs
    } else if (globalConfig) {
      const query = await cms.db.findGlobalVersions({
        global: globalConfig.slug,
        limit: 1,
        page: max + 1,
        pagination: false,
        req,
        sort: '-updatedAt',
        where,
      })

      ;[oldestAllowedDoc] = query.docs
    }

    if (oldestAllowedDoc?.updatedAt) {
      const deleteQuery: Where = {
        updatedAt: {
          less_than_equal: oldestAllowedDoc.updatedAt,
        },
      }

      if (collection) {
        deleteQuery.parent = {
          equals: id,
        }
      }

      const deleteVersionsArgs: DeleteVersionsArgs = { req, where: deleteQuery }

      if (globalConfig) {
        deleteVersionsArgs.globalSlug = slug
      } else {
        deleteVersionsArgs.collection = slug
      }

      await cms.db.deleteVersions(deleteVersionsArgs)
    }
  } catch (err) {
    cms.logger.error(err)
    cms.logger.error(
      `There was an error cleaning up old versions for the ${entityType} ${slug}`,
    )
  }
}
