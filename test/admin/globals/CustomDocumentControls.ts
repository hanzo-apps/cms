import type { GlobalConfig } from '@hanzo/cms'

import { customGlobalDocumentControlsSlug } from '../slugs.js'

export const GlobalCustomDocumentControls: GlobalConfig = {
  slug: customGlobalDocumentControlsSlug,
  admin: {
    components: {
      elements: {
        Status: '/components/Status/index.tsx#Status',
      },
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
  versions: {
    drafts: true,
  },
}
