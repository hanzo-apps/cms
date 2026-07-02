import type { CollectionConfig } from @hanzo/cms'from 

import { simpleSlug } from '../../slugs.js'

export const SimpleCollection: CollectionConfig = {
  slug: simpleSlug,
  admin: {
    useAsTitle: 'fieldA',
  },
  fields: [
    {
      name: 'fieldA',
      type: 'text',
    },
    {
      name: 'fieldB',
      type: 'text',
    },
  ],
}
