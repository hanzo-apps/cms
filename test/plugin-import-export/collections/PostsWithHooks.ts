import type { FieldBeforeImportHook } from '@hanzo/cms-plugin-import-export/types'
import type { CollectionConfig } from '@hanzo/cms'

import { postsWithHooksSlug } from '../shared.js'

export const PostsWithHooks: CollectionConfig = {
  slug: postsWithHooksSlug,
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'secret',
      type: 'text',
    },
    {
      name: 'count',
      type: 'number',
    },
    {
      name: 'email',
      type: 'text',
      custom: {
        'plugin-import-export': {
          hooks: {
            beforeImport: (({ value }) => {
              if (typeof value === 'string') {
                return value.toLowerCase()
              }
              return value
            }) satisfies FieldBeforeImportHook,
          },
        },
      },
    },
  ],
}
