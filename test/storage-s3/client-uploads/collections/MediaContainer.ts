import type { CollectionConfig } from '@hanzo/cms'

export const MediaContainer: CollectionConfig = {
  slug: 'media-container',
  fields: [
    {
      name: 'files',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
  ],
}
