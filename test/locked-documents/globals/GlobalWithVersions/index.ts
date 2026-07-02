import type { GlobalConfig } from '@hanzo/cms'

export const globalWithVersionsSlug = 'global-with-versions'

export const GlobalWithVersions: GlobalConfig = {
  slug: globalWithVersionsSlug,
  fields: [
    {
      name: 'text',
      type: 'text',
    },
  ],
  versions: {
    drafts: true,
  },
}
