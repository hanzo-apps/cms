import type { CollectionConfig } from @hanzo/cms'from 

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from @hanzo/cms'from 

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
