import type { CollectionConfig } from '@hanzo/cms'

export const RestrictedMedia: CollectionConfig = {
  slug: 'restricted-media',
  upload: {
    mimeTypes: ['image/png'],
    disableLocalStorage: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
