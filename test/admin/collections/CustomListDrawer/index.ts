import type { CollectionConfig } from '@hanzo/cms'

export const CustomListDrawer: CollectionConfig = {
  slug: 'custom-list-drawer',
  fields: [
    {
      name: 'customListDrawer',
      type: 'ui',
      admin: {
        components: {
          Field: '/collections/CustomListDrawer/Component.js#CustomListDrawer',
        },
      },
    },
  ],
}
