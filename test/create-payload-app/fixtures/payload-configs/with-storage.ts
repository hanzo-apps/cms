import { mongooseAdapter } from '@hanzo/cms-db-mongodb'
import { s3Storage } from '@hanzo/cms-storage-s3'
import { buildConfig } from '@hanzo/cms'

export default buildConfig({
  collections: [],
  db: mongooseAdapter({ url: process.env.DATABASE_URL || '' }),
  plugins: [
    s3Storage({
      bucket: process.env.S3_BUCKET || '',
      collections: {
        media: true,
      },
      config: {
        region: process.env.S3_REGION || '',
      },
    }),
  ],
})
