import type { CollectionConfig } from '@hanzo/cms'

import { categoriesSlug } from '../shared.js'

export const Categories: CollectionConfig = {
  slug: categoriesSlug,
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
