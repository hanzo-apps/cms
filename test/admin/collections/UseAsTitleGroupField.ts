import type { CollectionConfig } from '@hanzo/cms'

import { useAsTitleGroupFieldSlug } from '../slugs.js'

export const UseAsTitleGroupField: CollectionConfig = {
  slug: useAsTitleGroupFieldSlug,
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'group',
      label: 'unnamed group',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
  ],
}
