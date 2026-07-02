import type { GlobalConfig } from @hanzo/cms'from 

export const adminSlug = 'admin'

export const AdminGlobal: GlobalConfig = {
  slug: adminSlug,
  lockDocuments: {
    duration: 10,
  },
  fields: [
    {
      name: 'adminText',
      type: 'text',
    },
  ],
}
