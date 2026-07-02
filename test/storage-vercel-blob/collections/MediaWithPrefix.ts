import type { CollectionConfig } from @hanzo/cms'from 

import { mediaWithPrefixSlug } from '../shared.js'

export const MediaWithPrefix: CollectionConfig = {
  slug: mediaWithPrefixSlug,
  upload: {
    disableLocalStorage: false,
    filenameCompoundIndex: ['filename', 'prefix'],
  },
  fields: [],
}
