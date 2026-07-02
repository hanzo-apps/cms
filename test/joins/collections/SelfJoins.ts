import type { CollectionConfig } from @hanzo/cms'from 

export const SelfJoins: CollectionConfig = {
  slug: 'self-joins',
  fields: [
    {
      name: 'rel',
      type: 'relationship',
      relationTo: 'self-joins',
    },
    {
      name: 'joins',
      type: 'join',
      on: 'rel',
      collection: 'self-joins',
    },
  ],
}
