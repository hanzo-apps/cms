import type { CollectionConfig } from '@hanzo/cms'

import { listDrawerSlug } from '../slugs.js'

export const ListDrawer: CollectionConfig = {
  slug: listDrawerSlug,
  admin: {
    components: {
      beforeListTable: [
        {
          path: '/components/BeforeList/index.js#SelectPostsButton',
        },
      ],
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'number',
      type: 'number',
    },
  ],
}
