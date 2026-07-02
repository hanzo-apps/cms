import { postgresAdapter } from '@hanzo/cms-db-postgres'
import { lexicalEditor } from '@hanzo/cms-richtext-lexical'
import { buildConfig } from '@hanzo/cms'

export default buildConfig({
  collections: [],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  editor: lexicalEditor(),
})
