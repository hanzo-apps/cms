import type { CollectionConfig } from @hanzo/cms'from 

export const emailsSlug = 'emails'

export const EmailsCollection: CollectionConfig = {
  slug: emailsSlug,
  access: { create: () => true, update: () => true, delete: () => true, read: () => true },
  fields: [
    {
      name: 'email',
      type: 'email',
      unique: true,
      required: true,
    },
    {
      name: 'name',
      type: 'text',
    },
  ],
}
