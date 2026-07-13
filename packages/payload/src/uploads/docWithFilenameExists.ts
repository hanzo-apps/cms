import type { CMSRequest, Where } from '../types/index.js'

type Args = {
  collectionSlug: string
  filename: string
  path: string
  prefix?: string
  req: CMSRequest
}

export const docWithFilenameExists = async ({
  collectionSlug,
  filename,
  prefix,
  req,
}: Args): Promise<boolean> => {
  const where: Where = {
    filename: {
      equals: filename,
    },
  }

  if (prefix) {
    where.prefix = { equals: prefix }
  }

  const doc = await req.cms.db.findOne({
    collection: collectionSlug,
    req,
    where,
  })

  return !!doc
}
