import type { CollectionConfig } from @hanzo/cms'from 

import { group1Collection2Slug } from '../slugs.js'

export const CollectionGroup1B: CollectionConfig = {
  slug: group1Collection2Slug,
  admin: {
    group: 'One',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
