import type { GlobalConfig } from @hanzo/cms'from 

export const MaxVersions: GlobalConfig = {
  slug: 'max-versions',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
  versions: {
    max: 2,
    drafts: true,
  },
}
