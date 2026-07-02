import type { CollectionConfig } from @hanzo/cms'from 

import { textCollectionSlug } from '../slugs.js'

export const TextCollection: CollectionConfig = {
  slug: textCollectionSlug,
  admin: {
    useAsTitle: 'text',
  },
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
    },
  ],
}
