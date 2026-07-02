import type { CollectionConfig } from '@hanzo/cms'

export const UsersCollection: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      defaultValue: 'Payload dev',
    },
    {
      name: 'number',
      type: 'number',
      defaultValue: 42,
    },
  ],
}
