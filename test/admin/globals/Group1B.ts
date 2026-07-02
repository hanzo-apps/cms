import type { GlobalConfig } from @hanzo/cms'from 

import { group2GlobalSlug } from '../slugs.js'

export const GlobalGroup1B: GlobalConfig = {
  slug: group2GlobalSlug,
  admin: {
    group: 'Group',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
