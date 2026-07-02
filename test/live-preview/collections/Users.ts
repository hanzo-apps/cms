import type { CollectionConfig } from '@hanzo/cms'

import { usersSlug } from '../shared.js'

export const Users: CollectionConfig = {
  slug: usersSlug,
  auth: true,
  fields: [],
}
