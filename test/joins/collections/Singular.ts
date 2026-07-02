import type { CollectionConfig } from '@hanzo/cms'

export const singularSlug = 'singular'

export const Singular: CollectionConfig = {
  slug: singularSlug,
  fields: [
    {
      type: 'relationship',
      relationTo: 'categories',
      name: 'category',
    },
  ],
}
