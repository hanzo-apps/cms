import type { CollectionConfig } from @hanzo/cms'from 

import { baseRelationshipFields } from '../../baseFields.js'
import { relationTwoSlug } from '../../slugs.js'

export const Relation2: CollectionConfig = {
  fields: baseRelationshipFields,
  slug: relationTwoSlug,
}
