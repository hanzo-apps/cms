import type { Block } from '@hanzo/cms'

export const ContentBlock: Block = {
  slug: 'content',
  fields: [
    {
      name: 'text',
      type: 'text',
    },
  ],
}
