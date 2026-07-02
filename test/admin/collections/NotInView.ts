import type { CollectionConfig } from @hanzo/cms'from 

import { notInViewCollectionSlug } from '../slugs.js'

export const CollectionNotInView: CollectionConfig = {
  slug: notInViewCollectionSlug,
  admin: {
    group: false,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
