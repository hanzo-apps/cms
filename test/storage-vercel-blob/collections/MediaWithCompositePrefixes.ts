import type { CollectionConfig } from '@hanzo/cms'

import { mediaWithCompositePrefixesSlug } from '../shared.js'

export const MediaWithCompositePrefixes: CollectionConfig = {
  slug: mediaWithCompositePrefixesSlug,
  fields: [],
  upload: {
    disableLocalStorage: false,
    filenameCompoundIndex: ['filename', 'prefix'],
  },
}
