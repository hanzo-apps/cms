import type { CollectionConfig } from '@hanzo/cms'

import { localizedDraftsSlug } from '../../shared.js'

export const LocalizedDrafts: CollectionConfig = {
  slug: localizedDraftsSlug,
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: 'text',
      name: 'title',
      localized: true,
    },
  ],
}
