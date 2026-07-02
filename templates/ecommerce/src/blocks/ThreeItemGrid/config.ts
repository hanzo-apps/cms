import type { Block } from '@hanzo/cms'

export const ThreeItemGrid: Block = {
  slug: 'threeItemGrid',
  fields: [
    {
      name: 'products',
      type: 'relationship',
      admin: {
        isSortable: true,
      },
      hasMany: true,
      label: 'Products to show',
      maxRows: 3,
      minRows: 3,
      relationTo: 'products',
    },
  ],
  interfaceName: 'ThreeItemGridBlock',
  labels: {
    plural: 'Three Item Grids',
    singular: 'Three Item Grid',
  },
}
