import type { CollectionConfig } from '@hanzo/cms'

import { pagesSlug } from '../../slugs.js'

export const Pages: CollectionConfig = {
  slug: pagesSlug,
  admin: {
    useAsTitle: 'text',
  },
  enableQueryPresets: true,
  lockDocuments: false,
  fields: [
    {
      name: 'text',
      type: 'text',
    },
    {
      name: 'postsRelationship',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
    },
  ],
}
