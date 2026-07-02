import type { CollectionConfig } from '@hanzo/cms'

import { postsNoJobsQueueSlug } from '../shared.js'

export const PostsNoJobsQueue: CollectionConfig = {
  slug: postsNoJobsQueueSlug,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['id', 'title', '_status', 'content', 'updatedAt', 'createdAt'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      label: { en: 'Title', es: 'Título', de: 'Titel' },
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
}
