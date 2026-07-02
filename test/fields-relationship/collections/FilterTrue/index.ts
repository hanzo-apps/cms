import type { CollectionConfig } from @hanzo/cms'from 

import { baseRelationshipFields } from '../../baseFields.js'
import { relationTrueFilterOptionSlug } from '../../slugs.js'

export const RelationshipFilterTrue: CollectionConfig = {
  admin: {
    useAsTitle: 'name',
  },
  fields: baseRelationshipFields,
  slug: relationTrueFilterOptionSlug,
}
