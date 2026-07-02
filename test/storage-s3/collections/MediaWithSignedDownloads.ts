import type { CollectionConfig } from '@hanzo/cms'

import { mediaWithSignedDownloadsSlug } from '../shared.js'

export const MediaWithSignedDownloads: CollectionConfig = {
  slug: mediaWithSignedDownloadsSlug,
  upload: true,
  fields: [],
}
