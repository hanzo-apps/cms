import type { CollectionConfig } from @hanzo/cms'from 

import { editMenuItemsSlug } from '../slugs.js'

export const EditMenuItems: CollectionConfig = {
  slug: editMenuItemsSlug,
  admin: {
    components: {
      edit: {
        editMenuItems: [
          {
            path: '/components/EditMenuItems/index.js#EditMenuItems',
          },
          {
            path: '/components/EditMenuItemsServer/index.js#EditMenuItemsServer',
          },
        ],
      },
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
