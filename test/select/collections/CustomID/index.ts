import type { CollectionConfig } from '@hanzo/cms'

export const CustomID: CollectionConfig = {
  slug: 'custom-ids',
  fields: [
    {
      name: 'id',
      type: 'number',
    },
    {
      name: 'text',
      type: 'text',
    },
  ],
}
