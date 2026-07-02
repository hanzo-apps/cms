import type { CollectionConfig } from @hanzo/cms'from 

import { postSlug } from '../../shared.js'

export const Posts: CollectionConfig = {
  slug: postSlug,
  admin: {
    useAsTitle: 'title',
  },
  folders: true,
  trash: true,
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'relatedAutosave',
      type: 'relationship',
      relationTo: 'autosave',
    },
  ],
}
