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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// org == tenant. Every persistent primitive is per-org.
const ORG = process.env.HANZO_ORG || 'hanzo'

// A super user (global admin) may cross tenants; everyone else is org-scoped.
// Reused by the multi-tenant plugin AND the internal jobs queue lock-down.
const isSuper = (user: unknown): boolean =>
  Boolean(user && (user as { iamOrg?: string }).iamOrg === 'admin')

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  collections: [Users, Tenants, Pages, Media],
  editor: lexicalEditor(),
  // The jobs queue is a Payload FRAMEWORK collection (not tenant-scoped). Its
  // auth-only default let any org read another org's job inputs (schedulePublish
  // payloads) and enqueue jobs against another org's docs. Job execution and the
  // schedulePublish enqueue both run via the local API (overrideAccess), so
  // external REST/GraphQL access is never needed — lock it to super/internal.
  jobs: {
    jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
      ...defaultJobsCollection,
      access: {
        create: ({ req }) => isSuper(req.user),
        delete: ({ req }) => isSuper(req.user),
        read: ({ req }) => isSuper(req.user),
        update: ({ req }) => isSuper(req.user),
      },
    }),
  },
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // DB = Hanzo Base / SQLite (per-org). libsql; no Postgres/Mongo default.
  // push: true — each per-org embedded db is schema-synced from this config on
  // boot (Base model: on-demand per-tenant dbs, no migration files to ship).
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || `file:${path.resolve(dirname, `../data/${ORG}.db`)}`,
    },
    push: true,
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
      userHasAccessToAllTenants: (user) => isSuper(user),
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
