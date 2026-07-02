import type { CollectionConfig } from '@hanzo/cms'

export const Drafts: CollectionConfig = {
  slug: 'drafts',
  admin: {
    useAsTitle: 'title',
  },
  folders: true,
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
  versions: {
    drafts: true,
  },
}
