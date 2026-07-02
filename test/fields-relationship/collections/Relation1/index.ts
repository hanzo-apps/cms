import type { CollectionConfig } from @hanzo/cms'from 

import { baseRelationshipFields } from '../../baseFields.js'
import { relationOneSlug } from '../../slugs.js'

export const Relation1: CollectionConfig = {
  fields: baseRelationshipFields,
  slug: relationOneSlug,
}
