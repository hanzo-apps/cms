import type { CollectionConfig } from @hanzo/cms'from 

export const ForceSelect: CollectionConfig<'force-select'> = {
  slug: 'force-select',
  fields: [
    {
      name: 'text',
      type: 'text',
    },
    {
      name: 'forceSelected',
      type: 'text',
    },
    {
      name: 'array',
      type: 'array',
      fields: [
        {
          name: 'forceSelected',
          type: 'text',
        },
      ],
    },
  ],
  forceSelect: { array: { forceSelected: true }, forceSelected: true },
}
