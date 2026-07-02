import type { CollectionConfig } from '@hanzo/cms'

export const MediaWithPrefix: CollectionConfig = {
  slug: 'media-with-prefix',
  upload: {
    disableLocalStorage: false,
    filenameCompoundIndex: ['filename', 'prefix'],
  },
  fields: [
    {
      name: 'prefix',
      type: 'text',
    },
  ],
}
