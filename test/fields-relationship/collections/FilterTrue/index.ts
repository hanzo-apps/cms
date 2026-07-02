import type { CollectionConfig } from '@hanzo/cms'

import { baseRelationshipFields } from '../../baseFields.js'
import { relationTrueFilterOptionSlug } from '../../slugs.js'

export const RelationshipFilterTrue: CollectionConfig = {
  admin: {
    useAsTitle: 'name',
  },
  fields: baseRelationshipFields,
  slug: relationTrueFilterOptionSlug,
}
