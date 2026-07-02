import type { CollectionConfig } from @hanzo/cms'from 

export const StaticURLCollection: CollectionConfig = {
  slug: 'static-url',
  admin: {
    livePreview: {
      url: '/live-preview/static',
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}
