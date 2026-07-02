import type { CollectionConfig } from '@hanzo/cms'

export const ModifiedPrompts: CollectionConfig = {
  slug: 'modified-prompts',
  fields: [
    {
      name: 'original',
      type: 'textarea',
      admin: {
        description: 'The original prompt',
      },
      required: true,
    },
    {
      name: 'modified',
      type: 'textarea',
      admin: {
        description: 'The modified prompt',
      },
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'The user sent the prompt to modify',
      },
      required: true,
    },
  ],
}
