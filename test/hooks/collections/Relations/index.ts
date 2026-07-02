import type { CollectionConfig } from '@hanzo/cms'

export const relationsSlug = 'relations'

const Relations: CollectionConfig = {
  slug: relationsSlug,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
}

export default Relations
