import type { CollectionConfig } from @hanzo/cms'from 

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  access: {
    read: () => true,
  },
  fields: [],
}
