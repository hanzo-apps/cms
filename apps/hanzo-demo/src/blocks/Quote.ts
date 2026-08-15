import type { Block } from '@hanzo/cms'

/**
 * Pull quote. `attribution` names who said it, `source` the work it came from;
 * both stay optional, so an unattributed quote still saves.
 */
export const Quote: Block = {
  slug: 'quote',
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'attribution',
      type: 'text',
    },
    {
      name: 'source',
      type: 'text',
    },
  ],
  interfaceName: 'QuoteBlock',
  labels: {
    plural: 'Quotes',
    singular: 'Quote',
  },
}
