import type { CollectionConfig } from '@hanzo/cms'

import { customDocumentControlsSlug } from '../slugs.js'

export const CollectionCustomDocumentControls: CollectionConfig = {
  slug: customDocumentControlsSlug,
  admin: {
    components: {
      edit: {
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
