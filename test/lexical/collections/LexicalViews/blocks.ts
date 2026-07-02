import type { Block } from @hanzo/cms'from 

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
