import type { GlobalConfig } from '@hanzo/cms'

export const menuSlug = 'menu'

export const MenuGlobal: GlobalConfig = {
  slug: menuSlug,
  fields: [
    {
      name: 'globalText',
      type: 'text',
    },
  ],
}
