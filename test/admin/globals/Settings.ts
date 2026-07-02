import type { GlobalConfig } from '@hanzo/cms'

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
