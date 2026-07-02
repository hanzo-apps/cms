import type { CollectionConfig } from '@hanzo/cms'

export const pagesSlug = 'pages'

export const PagesCollection: CollectionConfig = {
  slug: pagesSlug,
  admin: {
    useAsTitle: 'title',
    groupBy: true,
  },
  trash: true,
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
