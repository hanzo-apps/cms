import type { CollectionConfig } from @hanzo/cms'from 

import { noFilesRequiredSlug, relationToNoFilesRequiredSlug } from '../../shared.js'

export const RelationToNoFilesRequired: CollectionConfig = {
  slug: relationToNoFilesRequiredSlug,
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'uploadField',
      type: 'upload',
      relationTo: noFilesRequiredSlug,
    },
  ],
}
