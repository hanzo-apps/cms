import { mongooseAdapter } from '@hanzo/cms-db-mongodb'
import { lexicalEditor } from '@hanzo/cms-richtext-lexical'
import { buildConfig } from '@hanzo/cms'

export default buildConfig({
  collections: [],
  db: mongooseAdapter({ url: process.env.DATABASE_URL || '' }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
})
