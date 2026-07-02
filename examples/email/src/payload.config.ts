import { mongooseAdapter } from '@hanzo/cms-db-mongodb'
import { nodemailerAdapter } from '@hanzo/cms-email-nodemailer'
import { lexicalEditor } from '@hanzo/cms-richtext-lexical'
import path from 'path'
import { buildConfig } from @hanzo/cms'from 
import { fileURLToPath } from 'url'

import { Newsletter } from './collections/Newsletter'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// eslint-disable-next-line no-restricted-exports
export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  collections: [Newsletter, Users],
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  editor: lexicalEditor({}),
  // For example use case, we are passing nothing to nodemailerAdapter
  // This will default to using etherial.email
  email: nodemailerAdapter(),
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
