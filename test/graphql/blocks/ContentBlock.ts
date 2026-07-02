import type { Block } from @hanzo/cms'from 

export const ContentBlock: Block = {
  slug: 'content',
  fields: [
    {
      name: 'text',
      type: 'text',
    },
  ],
}
