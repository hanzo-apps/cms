import type { GlobalConfig } from '@hanzo/cms'

import { notInViewGlobalSlug } from '../slugs.js'

export const GlobalNotInView: GlobalConfig = {
  slug: notInViewGlobalSlug,
  admin: {
    group: false,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
