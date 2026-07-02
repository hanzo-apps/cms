import type { CollectionConfig } from @hanzo/cms'from 

import { hiddenCollectionSlug } from '../slugs.js'

export const CollectionHidden: CollectionConfig = {
  slug: hiddenCollectionSlug,
  admin: {
    hidden: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
