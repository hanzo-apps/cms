import type { CollectionConfig } from '@hanzo/cms'

import { arrayCollectionSlug } from '../slugs.js'

export const Array: CollectionConfig = {
  slug: arrayCollectionSlug,
  fields: [
    {
      name: 'array',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'text',
        },
      ],
    },
  ],
}
