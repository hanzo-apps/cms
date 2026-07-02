import type { CollectionConfig } from '@hanzo/cms'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Don't need any user fields here
  ],
}
