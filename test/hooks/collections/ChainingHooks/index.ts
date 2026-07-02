import type { CollectionConfig } from @hanzo/cms'from 

export const chainingHooksSlug = 'chaining-hooks'

const AppendTextHook = ({ doc }) => ({
  ...doc,
  text: `${doc.text}!`,
})

const ChainingHooks: CollectionConfig = {
  slug: chainingHooksSlug,
  hooks: {
    afterRead: [AppendTextHook, AppendTextHook],
  },
  fields: [
    {
      type: 'text',
      name: 'text',
    },
  ],
}

export default ChainingHooks
