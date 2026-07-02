import type { GlobalConfig } from @hanzo/cms'from 

import { settingsGlobalSlug } from '../slugs.js'

export const Settings: GlobalConfig = {
  slug: settingsGlobalSlug,
  fields: [
    {
      type: 'checkbox',
      name: 'canAccessProtected',
    },
  ],
}
