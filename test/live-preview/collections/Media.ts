import type { CollectionConfig } from '@hanzo/cms'

import { mediaSlug } from '../shared.js'

export const Media: CollectionConfig = {
  slug: mediaSlug,
  upload: true,
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    // {
    //   name: 'caption',
    //   type: 'richText',
    // },
  ],
}
