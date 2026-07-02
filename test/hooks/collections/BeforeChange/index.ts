import type { CollectionConfig } from '@hanzo/cms'

export const BeforeChangeHooks: CollectionConfig = {
  slug: 'before-change-hooks',
  hooks: {
    beforeChange: [
      ({ data }) => {
        data.title = 'hi from hook'

        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
  ],
}
