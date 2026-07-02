import type { CollectionConfig } from '@hanzo/cms'

export const beforeOperationSlug = 'beforeOperation'

// Store the last operation for testing
let lastOperation: string | undefined

export const BeforeOperationCollection: CollectionConfig = {
  slug: beforeOperationSlug,
  versions: {
    drafts: true,
  },
  hooks: {
    beforeOperation: [
      ({ operation }) => {
        // Store operation for testing
        lastOperation = operation
      },
    ],
  },
  fields: [
    {
      name: 'category',
      type: 'text',
    },
  ],
}

export const getLastOperation = () => lastOperation
export const clearLastOperation = () => {
  lastOperation = undefined
}
