import type { CollectionConfig } from '@hanzo/cms'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  access: {
    read: () => true,
  },
  fields: [],
}
