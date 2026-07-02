import type { CollectionConfig } from '@hanzo/cms'

export const Points: CollectionConfig = {
  slug: 'points',
  fields: [
    {
      type: 'text',
      name: 'text',
    },
    {
      type: 'point',
      name: 'point',
    },
  ],
}
