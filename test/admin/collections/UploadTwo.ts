import type { CollectionConfig } from @hanzo/cms'from 

import { uploadTwoCollectionSlug } from '../slugs.js'

export const UploadTwoCollection: CollectionConfig = {
  slug: uploadTwoCollectionSlug,
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
  upload: true,
}
