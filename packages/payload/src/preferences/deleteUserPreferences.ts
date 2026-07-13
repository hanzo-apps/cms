import type { SanitizedCollectionConfig } from '../collections/config/types.js'
import type { CMS } from '../index.js'
import type { CMSRequest } from '../types/index.js'

import { preferencesCollectionSlug } from './config.js'

type Args = {
  collectionConfig: SanitizedCollectionConfig
  /**
   * User IDs to delete
   */
  ids: (number | string)[]
  cms: CMS
  req: CMSRequest
}
export const deleteUserPreferences = async ({ collectionConfig, ids, cms, req }: Args) => {
  if (collectionConfig.auth) {
    await cms.db.deleteMany({
      collection: preferencesCollectionSlug,
      req,
      where: {
        or: [
          {
            and: [
              {
                'user.value': { in: ids },
              },
              {
                'user.relationTo': { equals: collectionConfig.slug },
              },
            ],
          },
          {
            key: { in: ids.map((id) => `collection-${collectionConfig.slug}-${id}`) },
          },
        ],
      },
    })
  } else {
    await cms.db.deleteMany({
      collection: preferencesCollectionSlug,
      req,
      where: {
        key: { in: ids.map((id) => `collection-${collectionConfig.slug}-${id}`) },
      },
    })
  }
}
