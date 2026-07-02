import type { CollectionConfig } from @hanzo/cms'from 

import { lexicalEditor } from '@hanzo/cms-richtext-lexical'

export const Regression2: CollectionConfig = {
  slug: 'regression2',
  fields: [
    {
      name: 'group',
      type: 'group',
      fields: [
        {
          name: 'richText1',
          type: 'richText',
          editor: lexicalEditor(),
        },
        {
          name: 'text',
          type: 'text',
        },
      ],
    },
    {
      name: 'array',
      type: 'array',
      access: {
        update: () => false,
      },
      fields: [
        {
          name: 'richText2',
          type: 'richText',
          editor: lexicalEditor(),
        },
      ],
    },
  ],
}
