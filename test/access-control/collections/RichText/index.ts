import type { CollectionConfig } from '@hanzo/cms'

export const RichText: CollectionConfig = {
  slug: 'rich-text',
  fields: [
    {
      name: 'blocks',
      type: 'blocks',
      blocks: [
        {
          slug: 'richText',
          fields: [
            {
              name: 'richText',
              type: 'richText',
            },
          ],
        },
      ],
    },
  ],
}
