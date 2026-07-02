import type { CollectionConfig } from '@hanzo/cms'

export const SimpleRelationshipCollection: CollectionConfig = {
  slug: 'simple-relationship',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'text',
      name: 'title',
    },
  ],
}
