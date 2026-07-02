import type { CollectionConfig } from '@hanzo/cms'

export const postsSlug = 'posts'

export const Posts: CollectionConfig = {
  slug: postsSlug,
  admin: {
    useAsTitle: 'title',
  },
  trash: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'localizedField',
      type: 'text',
      localized: true,
    },
  ],
  versions: {
    drafts: true,
  },
}
