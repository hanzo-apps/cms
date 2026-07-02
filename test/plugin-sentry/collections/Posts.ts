import type { CollectionConfig } from @hanzo/cms'from 

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: () => false,
    read: () => true,
  },
  fields: [
    {
      name: 'text',
      type: 'text',
    },
  ],
}
