import type { CollectionConfig } from @hanzo/cms'from 

export const Autosave: CollectionConfig = {
  slug: 'autosave',
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
    drafts: {
      autosave: true,
    },
  },
}
