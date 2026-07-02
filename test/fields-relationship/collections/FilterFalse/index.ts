import type { CollectionConfig } from '@hanzo/cms'

import { baseRelationshipFields } from '../../baseFields.js'
import { relationFalseFilterOptionSlug } from '../../slugs.js'

export const RelationshipFilterFalse: CollectionConfig = {
  admin: {
    useAsTitle: 'name',
  },
  fields: baseRelationshipFields,
  slug: relationFalseFilterOptionSlug,
}
