import type { CollectionConfig } from '@hanzo/cms'

import { collection2Slug } from '../../slugs.js'

export const Collection2: CollectionConfig = {
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  slug: collection2Slug,
}
