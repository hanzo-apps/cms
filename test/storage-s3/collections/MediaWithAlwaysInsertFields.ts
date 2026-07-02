import type { CollectionConfig } from @hanzo/cms'from 

import { mediaWithAlwaysInsertFieldsSlug } from '../shared.js'

export const MediaWithAlwaysInsertFields: CollectionConfig = {
  slug: mediaWithAlwaysInsertFieldsSlug,
  upload: true,
  fields: [
    {
      name: 'alt',
      label: 'Alt Text',
      type: 'text',
    },
  ],
}
