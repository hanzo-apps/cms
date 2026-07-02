import type { CollectionConfig } from @hanzo/cms'from 

import { usersCollectionSlug } from '../slugs.js'

export const Users: CollectionConfig = {
  slug: usersCollectionSlug,
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'textField',
      type: 'text',
    },
    {
      name: 'sidebarField',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
