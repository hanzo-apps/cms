import type { CollectionConfig } from @hanzo/cms'from 

export const autosavePostsSlug = 'autosave-posts'

export const AutosavePostsCollection: CollectionConfig = {
  slug: autosavePostsSlug,
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'computedTitle',
      type: 'text',
      hooks: {
        beforeChange: [({ data }) => data?.title],
      },
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
    },
  },
}
