import type { CollectionConfig } from @hanzo/cms'from 

import { localizedCollectionSlug } from '../slugs.js'

export const Localized: CollectionConfig = {
  slug: localizedCollectionSlug,
  admin: {
    useAsTitle: 'title',
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
  ],
}
