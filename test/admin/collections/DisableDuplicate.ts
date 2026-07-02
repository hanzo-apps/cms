import type { CollectionConfig } from '@hanzo/cms'

import { disableDuplicateSlug } from '../slugs.js'

export const DisableDuplicate: CollectionConfig = {
  slug: disableDuplicateSlug,
  disableDuplicate: true,
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
