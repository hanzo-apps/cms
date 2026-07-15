import { buildConfig } from '@hanzo/cms'
import { hanzoIAMStrategy } from '@hanzo/cms-auth-iam'
import { sqliteAdapter } from '@hanzo/cms-db-sqlite'
import { multiTenantPlugin } from '@hanzo/cms-plugin-multi-tenant'
import { whiteLabelPlugin } from '@hanzo/cms-plugin-whitelabel'
import { lexicalEditor } from '@hanzo/cms-richtext-lexical'
import { s3Storage } from '@hanzo/cms-storage-s3'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media.js'
import { Pages } from './collections/Pages.js'
import { Tenants } from './collections/Tenants.js'
import { Users } from './collections/Users.js'
import { migrations } from './migrations/index.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// org == tenant. Every persistent primitive is per-org.
const ORG = process.env.HANZO_ORG || 'hanzo'

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    // Hanzo branding on the admin panel — the browser tab / login no longer
    // shows the upstream framework name.
    meta: {
      description: 'Hanzo CMS — headless content for the Hanzo platform.',
      title: 'Hanzo CMS',
      titleSuffix: '— Hanzo CMS',
    },
  },
  collections: [Users, Tenants, Pages, Media],
  editor: lexicalEditor(),
  secret: process.env.CMS_SECRET || 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // DB = Hanzo Base / SQLite (per-org). libsql; no Postgres/Mongo default.
  // prodMigrations run once on boot in production (the dev-only schema push is
  // skipped there) — this is how the local-auth columns reach the live DB.
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || `file:${path.resolve(dirname, `../data/${ORG}.db`)}`,
    },
    prodMigrations: migrations,
  }),
  plugins: [
    // Media/DAM -> SeaweedFS (hanzoai/s3), per-org prefix. forcePathStyle required.
    s3Storage({
      bucket: process.env.S3_BUCKET || 'hanzo-cms',
      collections: {
        media: { prefix: ORG },
      },
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        endpoint: process.env.S3_ENDPOINT || 'https://s3.hanzo.ai',
        forcePathStyle: true,
        region: process.env.S3_REGION || 'us-east-1',
      },
    }),
    // Multi-tenancy keyed to the IAM org (org == tenant). The ONE tenancy.
    multiTenantPlugin({
      collections: {
        media: {},
        pages: {},
      },
      tenantsSlug: 'tenants',
      userHasAccessToAllTenants: (user) => {
        const u = user as { iamOrg?: string; isAdmin?: boolean } | null
        return Boolean(u && (u.iamOrg === 'admin' || u.isAdmin))
      },
    }),
    // Brand-neutral / white-label by domain. Neutral when no brand matches.
    whiteLabelPlugin({
      brands: [
        // Example brands. No '*' fallback -> unmatched hosts render neutral.
        { name: 'Lux', hostnames: ['cms.lux.network'] },
        { name: 'Zoo', hostnames: ['cms.zoo.ngo'] },
        { name: 'MaxPower', hostnames: ['maxpower.hanzo.cms'] },
      ],
    }),
  ],
  sharp,
})
