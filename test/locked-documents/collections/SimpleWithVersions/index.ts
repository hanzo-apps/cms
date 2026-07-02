import type { CollectionConfig } from @hanzo/cms'from 

import { simpleWithVersionsSlug } from '../../slugs.js'

export const SimpleWithVersionsCollection: CollectionConfig = {
  slug: simpleWithVersionsSlug,
  admin: {
    useAsTitle: 'fieldA',
  },
  fields: [
    {
      name: 'fieldA',
      type: 'text',
    },
    {
      name: 'fieldB',
      type: 'text',
    },
  ],
  versions: {
    drafts: true,
  },
}
