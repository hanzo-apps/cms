import type { GlobalConfig } from @hanzo/cms'from 

import { hiddenGlobalSlug } from '../slugs.js'

export const GlobalHidden: GlobalConfig = {
  slug: hiddenGlobalSlug,
  admin: {
    hidden: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
