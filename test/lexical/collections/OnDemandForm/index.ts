import type { CollectionConfig } from @hanzo/cms'from 

export const OnDemandForm: CollectionConfig = {
  slug: 'OnDemandForm',
  fields: [
    {
      name: 'json',
      type: 'json',
      admin: {
        components: {
          Field: './collections/OnDemandForm/Component.js#Component',
        },
      },
    },
  ],
}
