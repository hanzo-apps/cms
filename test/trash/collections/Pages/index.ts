import type { CollectionConfig } from '@hanzo/cms'

import { postsSlug } from '../Posts/index.js'

export const pagesSlug = 'pages'

export const Pages: CollectionConfig = {
  slug: pagesSlug,
  admin: {
    useAsTitle: 'title',
  },
  trash: false, // Soft deletes are not enabled for this collection
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: postsSlug,
      hasMany: true,
    },
    {
      name: 'featuredPost',
      type: 'relationship',
      relationTo: postsSlug,
    },
  ],
  versions: {
    drafts: true,
  },
}
