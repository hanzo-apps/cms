import type { CollectionConfig } from @hanzo/cms'from 

import { customRowIDSlug } from '../../slugs.js'

export const CustomRowID: CollectionConfig = {
  slug: customRowIDSlug,
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'id',
          type: 'text',
        },
      ],
    },
  ],
  labels: {
    plural: 'Custom Row IDs',
    singular: 'Custom Row ID',
  },
}
