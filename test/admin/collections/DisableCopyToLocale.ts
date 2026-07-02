import type { CollectionConfig } from '@hanzo/cms'

import { disableCopyToLocale } from '../slugs.js'

export const DisableCopyToLocale: CollectionConfig = {
  slug: disableCopyToLocale,
  admin: {
    disableCopyToLocale: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
