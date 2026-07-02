import type { CollectionConfig } from @hanzo/cms'from 

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
