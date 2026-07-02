import type { CollectionConfig } from '@hanzo/cms'

import { baseRelationshipFields } from '../../baseFields.js'
import { relationWithTitleSlug } from '../../slugs.js'

export const RelationWithTitle: CollectionConfig = {
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    ...baseRelationshipFields,
    {
      name: 'meta',
      fields: [
        {
          name: 'title',
          label: 'Meta Title',
          type: 'text',
        },
      ],
      type: 'group',
    },
  ],
  slug: relationWithTitleSlug,
}
