import type { DocumentPreferences, CMS, TypedUser } from '@hanzo/cms'

import { sanitizeID } from '@hanzo/cms-ui/shared'

type Args = {
  collectionSlug?: string
  globalSlug?: string
  id?: number | string
  cms: CMS
  user: TypedUser
}

export const getDocPreferences = async ({
  id,
  collectionSlug,
  globalSlug,
  cms,
  user,
}: Args): Promise<DocumentPreferences> => {
  let preferencesKey

  if (collectionSlug && id) {
    preferencesKey = `collection-${collectionSlug}-${id}`
  }

  if (globalSlug) {
    preferencesKey = `global-${globalSlug}`
  }

  if (preferencesKey) {
    const preferencesResult = (await cms.find({
      collection: 'cms-preferences',
      depth: 0,
      limit: 1,
      where: {
        and: [
          {
            key: {
              equals: preferencesKey,
            },
          },
          {
            'user.relationTo': {
              equals: user.collection,
            },
          },
          {
            'user.value': {
              equals: sanitizeID(user.id),
            },
          },
        ],
      },
    })) as unknown as { docs: { value: DocumentPreferences }[] }

    if (preferencesResult?.docs?.[0]?.value) {
      return preferencesResult.docs[0].value
    }
  }

  return { fields: {} }
}
