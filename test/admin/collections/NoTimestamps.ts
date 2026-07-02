import type { CollectionConfig } from @hanzo/cms'from 

export const noTimestampsSlug = 'no-timestamps'

export const NoTimestampsCollection: CollectionConfig = {
  slug: noTimestampsSlug,
  timestamps: false,
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
