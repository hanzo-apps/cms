import type { CollectionConfig } from @hanzo/cms'from 

export const nonUniqueSortSlug = 'non-unique-sort'

export const NonUniqueSortCollection: CollectionConfig = {
  slug: nonUniqueSortSlug,
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'order',
      type: 'number',
    },
  ],
}
