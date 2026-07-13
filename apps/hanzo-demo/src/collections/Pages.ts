import type { CollectionConfig } from '@hanzo/cms'

/**
 * Content collection with the full CMS-native publishing flow:
 * versions + drafts + scheduled publish. Proves draft -> publish.
 * Tenant-scoped by the multi-tenant plugin (org == tenant).
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
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
