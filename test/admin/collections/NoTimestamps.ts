import type { CollectionConfig } from '@hanzo/cms'

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
