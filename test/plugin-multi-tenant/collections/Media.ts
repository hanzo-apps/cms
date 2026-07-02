import type { CollectionConfig } from '@hanzo/cms'

import { mediaSlug } from '../shared.js'

export const Media: CollectionConfig = {
  slug: mediaSlug,
  admin: {
    useAsTitle: 'filename',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
  upload: true,
}
