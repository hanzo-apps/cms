import type { CollectionConfig } from '@hanzo/cms'

import { mongooseAdapter } from '@hanzo/cms-db-mongodb'
import { lexicalEditor } from '@hanzo/cms-richtext-lexical'
import { buildConfig } from '@hanzo/cms'

const Users: CollectionConfig = {
  slug: 'users',
  fields: [],
}

export default buildConfig({
  collections: [Users],
  db: mongooseAdapter({ url: process.env.DATABASE_URL || '' }),
  editor: lexicalEditor(),
})
