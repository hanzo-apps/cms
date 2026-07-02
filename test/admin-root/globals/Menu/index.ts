import type { GlobalConfig } from @hanzo/cms'from 

export const menuSlug = 'menu'

export const MenuGlobal: GlobalConfig = {
  slug: menuSlug,
  versions: {
    drafts: false,
  },
  fields: [
    {
      name: 'globalText',
      type: 'text',
    },
  ],
}
