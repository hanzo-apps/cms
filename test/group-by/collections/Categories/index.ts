import type { CollectionConfig } from '@hanzo/cms'

export const categoriesSlug = 'categories'

export const CategoriesCollection: CollectionConfig = {
  slug: categoriesSlug,
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
