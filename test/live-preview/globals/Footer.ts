import type { GlobalConfig } from '@hanzo/cms'

import link from '../fields/link.js'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      maxRows: 6,
      fields: [link()],
    },
  ],
}
