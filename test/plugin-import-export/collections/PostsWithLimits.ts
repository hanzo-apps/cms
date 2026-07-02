import type { CollectionConfig } from '@hanzo/cms'

import { postsWithLimitsSlug } from '../shared.js'

export const PostsWithLimits: CollectionConfig = {
  slug: postsWithLimitsSlug,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['id', 'title', 'updatedAt', 'createdAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
    },
  ],
}
