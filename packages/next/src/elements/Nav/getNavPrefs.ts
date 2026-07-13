import type { NavPreferences, CMSRequest } from '@hanzo/cms'

import { PREFERENCE_KEYS } from '@hanzo/cms/shared'
import { cache } from 'react'

export const getNavPrefs = cache(async (req: CMSRequest): Promise<NavPreferences> => {
  return req?.user?.collection
    ? await req.cms
        .find({
          collection: 'cms-preferences',
          depth: 0,
          limit: 1,
          pagination: false,
          req,
          where: {
            and: [
              {
                key: {
                  equals: PREFERENCE_KEYS.NAV,
                },
              },
              {
                'user.relationTo': {
                  equals: req.user.collection,
                },
              },
              {
                'user.value': {
                  equals: req?.user?.id,
                },
              },
            ],
          },
        })
        ?.then((res) => res?.docs?.[0]?.value)
    : null
})
