import type { CollectionConfig } from @hanzo/cms'from 

import { afterReadSlug } from '../../shared.js'

export const AfterReadCollection: CollectionConfig = {
  slug: afterReadSlug,
  hooks: {
    afterRead: [
      ({ doc }) => {
        return {
          ...doc,
          title: 'afterRead',
        }
      },
      () => {
        return undefined
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
