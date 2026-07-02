import type { Block } from @hanzo/cms'from 

import { lexicalEditor } from '@hanzo/cms-richtext-lexical'

export const lexicalViewsFrontendBlocks: Block[] = [
  {
    slug: 'banner',
    fields: [
      {
        name: 'type',
        type: 'select',
        defaultValue: 'normal',
        options: [
          { label: 'Normal', value: 'normal' },
          { label: 'Important', value: 'important' },
        ],
        required: true,
      },
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      {
        name: 'content',
        type: 'richText',
        editor: lexicalEditor({
          features: ({ defaultFeatures }) => [...defaultFeatures],
          views: './collections/LexicalViewsFrontend/views.js#lexicalFrontendViews',
        }),
      },
    ],
    interfaceName: 'BannerBlock',
  },
]
