import type { CollectionConfig } from '@hanzo/cms'

import { postsSlug } from '../../slugs.js'

export const Posts: CollectionConfig = {
  slug: postsSlug,
  admin: {
    useAsTitle: 'text',
    groupBy: true,
  },
  enableQueryPresets: true,
  lockDocuments: false,
  fields: [
    {
      name: 'text',
      type: 'text',
    },
  ],
}
