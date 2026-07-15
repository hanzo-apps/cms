import type { CollectionConfig } from '@hanzo/cms'

/**
 * Content collection with the full CMS-native publishing flow:
 * versions + drafts + scheduled publish. Proves draft -> publish.
 * Tenant-scoped by the multi-tenant plugin (org == tenant).
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    // Headless read model: PUBLISHED docs are world-readable (storefronts fetch
    // them with no token); drafts and every write stay gated exactly as before.
    // The multi-tenant plugin composes this (withTenantAccess): an authenticated
    // caller returns `true` and the plugin then scopes reads to their org; an
    // anonymous caller has no user, so the plugin adds NO tenant constraint and
    // this filter stands alone — published docs of ANY tenant are public, which
    // is correct for a headless CMS serving many brands' storefronts.
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
  versions: {
    drafts: {
      autosave: false,
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
}
