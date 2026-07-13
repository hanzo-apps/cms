import type { CMSRequest, Where } from '../../types/index.js'

import { appendNonTrashedFilter } from '../../utilities/appendNonTrashedFilter.js'

export const initOperation = async (args: {
  collection: string
  req: CMSRequest
}): Promise<boolean> => {
  const { collection: slug, req } = args

  const collectionConfig = req.cms.config.collections?.find((c) => c.slug === slug)

  // Exclude trashed documents unless `trash: true`
  const where: Where = appendNonTrashedFilter({
    enableTrash: Boolean(collectionConfig?.trash),
    trash: false,
    where: {},
  })

  const doc = await req.cms.db.findOne({
    collection: slug,
    req,
    where,
  })

  return !!doc
}
