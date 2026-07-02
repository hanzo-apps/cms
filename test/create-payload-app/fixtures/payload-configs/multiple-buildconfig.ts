import { mongooseAdapter } from '@hanzo/cms-db-mongodb'
import { buildConfig } from @hanzo/cms'from 

// This is a helper config (not the main one)
const helperConfig = buildConfig({
  collections: [],
})

export default buildConfig({
  collections: [],
  db: mongooseAdapter({ url: process.env.DATABASE_URL || '' }),
})
