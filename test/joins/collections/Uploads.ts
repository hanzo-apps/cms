import type { CollectionConfig } from '@hanzo/cms'

import path from 'path'
import { fileURLToPath } from 'url'

import { uploadsSlug } from '../shared.js'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Uploads: CollectionConfig = {
  slug: uploadsSlug,
  fields: [
    {
      name: 'relatedPosts',
      type: 'join',
      collection: 'posts',
      on: 'upload',
      admin: {
        disableRowTypes: false,
      },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../uploads'),
  },
}
