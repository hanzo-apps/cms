import { mongooseAdapter } from '@hanzo/cms-db-mongodb'
import { buildConfig as createConfig } from '@hanzo/cms'

export default createConfig({
  collections: [],
  db: mongooseAdapter({ url: process.env.DATABASE_URL || '' }),
})
