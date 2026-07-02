import type { CollectionConfig } from @hanzo/cms'from 

export const mediaWithDocPrefixSlug = 'media-with-doc-prefix'

export const MediaWithDocPrefix: CollectionConfig = {
  slug: mediaWithDocPrefixSlug,
  upload: {
    filenameCompoundIndex: ['prefix', 'filename'],
  },
  fields: [
    {
      name: 'prefix',
      type: 'text',
      defaultValue: () => `doc-${Math.random().toString(36).slice(2, 10)}`,
    },
  ],
}
