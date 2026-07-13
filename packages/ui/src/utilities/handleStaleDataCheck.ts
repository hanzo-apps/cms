import type { CMSRequest } from '@hanzo/cms'

import { hasDraftsEnabled } from '@hanzo/cms/shared'

type Args = {
  collectionSlug?: string
  globalSlug?: string
  id?: number | string
  originalUpdatedAt: string
  req: CMSRequest
}

type Result = {
  currentUpdatedAt: string
  isStale: boolean
}

export const handleStaleDataCheck = async ({
  id,
  collectionSlug,
  globalSlug,
  originalUpdatedAt,
  req,
}: Args): Promise<Result> => {
  let currentUpdatedAt: string

  try {
    if (collectionSlug && id) {
      const collection = req.cms.config.collections.find((c) => c.slug === collectionSlug)
      const collectionHasDrafts = collection ? hasDraftsEnabled(collection) : false

      // Fetch current document to compare updatedAt
      const currentDoc = await req.cms.findByID({
        id,
        collection: collectionSlug,
        depth: 0,
        draft: collectionHasDrafts,
        overrideAccess: false,
        select: {
          updatedAt: true,
        },
        user: req.user,
      })

      currentUpdatedAt = currentDoc?.updatedAt as string
    } else if (globalSlug) {
      const global = req.cms.config.globals.find((g) => g.slug === globalSlug)
      const globalHasDrafts = global ? hasDraftsEnabled(global) : false

      // Fetch current global to compare updatedAt
      const currentGlobal = await req.cms.findGlobal({
        slug: globalSlug,
        depth: 0,
        draft: globalHasDrafts,
        overrideAccess: false,
        select: {
          updatedAt: true,
        },
        user: req.user,
      })

      currentUpdatedAt = currentGlobal?.updatedAt as string
    }

    // Compare timestamps
    const isStale = currentUpdatedAt && currentUpdatedAt !== originalUpdatedAt

    return {
      currentUpdatedAt,
      isStale: Boolean(isStale),
    }
  } catch (err) {
    // If we can't fetch the document, assume it's not stale
    req.cms.logger.error({ err, msg: 'Error checking for stale data' })
    return {
      currentUpdatedAt: originalUpdatedAt,
      isStale: false,
    }
  }
}
