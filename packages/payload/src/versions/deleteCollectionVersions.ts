import type { CMSRequest } from '../types/index.js'

import { type CMS } from '../index.js'

type Args = {
  id?: number | string
  cms: CMS
  req?: CMSRequest
  slug: string
}

export const deleteCollectionVersions = async ({ id, slug, cms, req }: Args): Promise<void> => {
  try {
    await cms.db.deleteVersions({
      collection: slug,
      req,
      where: {
        parent: {
          equals: id,
        },
      },
    })
  } catch (err) {
    cms.logger.error({
      err,
      msg: `There was an error removing versions for the deleted ${slug} document with ID ${id}.`,
    })
  }
}
