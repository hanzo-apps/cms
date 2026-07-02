import type { CollectionConfig } from @hanzo/cms'from 

export const BaseListFilter: CollectionConfig = {
  slug: 'base-list-filters',
  admin: {
    baseListFilter: () => ({
      title: {
        not_equals: 'hide me',
      },
    }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
