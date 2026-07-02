import type { GlobalConfig } from @hanzo/cms'from 

import { noApiViewGlobalSlug } from '../slugs.js'

export const GlobalNoApiView: GlobalConfig = {
  slug: noApiViewGlobalSlug,
  admin: {
    hideAPIURL: true,
  },
  fields: [],
}
