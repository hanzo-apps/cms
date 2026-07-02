import type { CollectionConfig } from @hanzo/cms'from 

import { usersSlug } from '../shared.js'

export const Users: CollectionConfig = {
  slug: usersSlug,
  auth: true,
  fields: [],
}
