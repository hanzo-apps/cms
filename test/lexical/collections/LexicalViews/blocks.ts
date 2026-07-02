import type { Block } from '@hanzo/cms'

export const lexicalViewsBlocks: Block[] = [
  {
    slug: 'viewsTestBlock',
    fields: [
      {
        name: 'text',
        type: 'text',
      },
    ],
    interfaceName: 'ViewsTestBlock',
  },
]
