import { buildConfig } from '@hanzo/cms'
import { claimOnly, isSuperAdmin } from '@hanzo/cms-auth-iam'
import { sqliteAdapter } from '@hanzo/cms-db-sqlite'
import { HanzoAIFeature, hanzoAIPlugin } from '@hanzo/cms-plugin-ai'
import { multiTenantPlugin } from '@hanzo/cms-plugin-multi-tenant'
import { whiteLabelPlugin } from '@hanzo/cms-plugin-whitelabel'
import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  lexicalEditor,
} from '@hanzo/cms-richtext-lexical'
import { s3Storage } from '@hanzo/cms-storage-s3'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Callout, CodeBlock, Embed, Quote } from './blocks/index.js'
import { Media } from './collections/Media.js'
import { Pages } from './collections/Pages.js'
import { Tenants } from './collections/Tenants.js'
import { Users } from './collections/Users.js'
import { migrations } from './migrations/index.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// org == tenant. Every persistent primitive is per-org.
const ORG = process.env.HANZO_ORG || 'hanzo'

// The one origin this deployment serves. It names the host the admin builds its
// links against AND the origin the session cookie may be presented from, which
// are the same fact and so are read from one place.
const SERVER_URL = process.env.SERVER_URL || 'https://cms.hanzo.ai'

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    // The login card and the nav header draw `graphics`, not the meta icons, so
    // without these the admin still showed the upstream framework's mark on the
    // one screen every user sees before they are let in. Paths resolve against
    // importMap.baseDir and are wired by `generate:importmap`, which the build
    // script runs ahead of `next build`.
    components: {
      graphics: {
        Icon: '/components/HanzoIcon#HanzoIcon',
        Logo: '/components/HanzoLogo#HanzoLogo',
      },
      // Identity is IAM's, so these two screens are doors onto it rather than
      // forms of their own. getRouteData resolves a one-segment route to its view
      // key and consults the configured views BEFORE the built-ins, so these
      // replace the framework's login and logout while keeping their chrome.
      views: {
        login: { Component: '/components/IAMLogin#IAMLogin' },
        logout: { Component: '/components/IAMLogout#IAMLogout' },
      },
    },
    // Hanzo branding on the admin panel — the browser tab / login no longer
    // shows the upstream framework name.
    meta: {
      description: 'Hanzo CMS — headless content for the Hanzo platform.',
      // Tab icon: the Hanzo mark, served from this app's public/ dir. Ink is
      // inverted for the dark tab bar, so the mark stays legible either way.
      icons: [
        { type: 'image/svg+xml', rel: 'icon', url: '/icon-black.svg' },
        {
          type: 'image/svg+xml',
          media: '(prefers-color-scheme: dark)',
          rel: 'icon',
          url: '/icon-white.svg',
        },
      ],
      // No `title` here: every view spreads admin.meta OVER its own title, so
      // setting one would stamp "Hanzo CMS — Hanzo CMS" on every page and lose
      // the view name. The suffix alone gives "Dashboard — Hanzo CMS".
      titleSuffix: '— Hanzo CMS',
    },
  },
  collections: [Users, Tenants, Pages, Media],
  // Which origins may present the session cookie. Empty means "any", and the
  // cookie is read on same-site requests, so naming this origin is what stops
  // another one from riding it.
  csrf: [SERVER_URL],
  // The editor's whole surface is configuration. BlocksFeature generates its own
  // slash-menu group and fixed-toolbar entries from the blocks it is given, so
  // the block and slash-command editor is these four declarations rather than
  // code. Everything here ships in the richtext package already.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      BlocksFeature({ blocks: [CodeBlock, Callout, Quote, Embed], inlineBlocks: [] }),
      EXPERIMENTAL_TableFeature(),
      HanzoAIFeature(),
    ],
  }),
  // The job queue is a framework collection, added by sanitizeConfig after every
  // plugin has run, so the multi-tenant plugin never sees it and it kept the
  // auth-only default while exposing REST endpoints. That let any authenticated
  // org read other orgs' job rows — a schedule-publish job carries the target
  // document in its `input` — and enqueue jobs against documents it does not
  // own. Nothing outside the server needs this collection: jobs are enqueued and
  // run through the local API, which overrides access.
  jobs: {
    // The rows and the control plane are one surface: reading a job exposes the
    // document in its `input`, and running or cancelling one acts on that
    // document. Both answer to the same predicate. A job carries no tenant, so
    // there is nothing narrower to scope it by.
    access: {
      cancel: ({ req }) => isSuperAdmin(req.user),
      queue: ({ req }) => isSuperAdmin(req.user),
      run: ({ req }) => isSuperAdmin(req.user),
    },
    jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
      ...defaultJobsCollection,
      access: {
        create: ({ req }) => isSuperAdmin(req.user),
        delete: ({ req }) => isSuperAdmin(req.user),
        read: ({ req }) => isSuperAdmin(req.user),
        update: ({ req }) => isSuperAdmin(req.user),
      },
    }),
  },
  // The chart maps this from a secretKeyRef with no `optional`, so a pod
  // missing it never starts and the fallback is reachable only in development.
  secret: process.env.CMS_SECRET || 'dev-secret-change-me',
  // Names the host the admin and its links are built against, so a request
  // header cannot decide where a link points.
  serverURL: SERVER_URL,
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
      // Membership follows the IAM `owner` claim, which the strategy rewrites on
      // every sign-in. Field access holds REST and GraphQL to that, so a caller
      // cannot add itself to a tenant between sign-ins.
      tenantsArrayField: { arrayFieldAccess: claimOnly, tenantFieldAccess: claimOnly },
      tenantsSlug: 'tenants',
      // Reserved `admin` org only. The jobs access above reads the same predicate.
      userHasAccessToAllTenants: isSuperAdmin,
    }),
    // Drafting, rewriting and image generation, each call carrying the editor's
    // OWN IAM bearer. Attribution, spend limits and metering are then the
    // gateway's, against the editor's org, and this deployment writes no billing
    // code and holds no AI credential.
    hanzoAIPlugin(),
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
