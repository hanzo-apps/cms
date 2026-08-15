import type { Block } from '@hanzo/cms'

import { lexicalEditor } from '@hanzo/cms-richtext-lexical'

/**
 * Aside that lifts a remark out of the surrounding prose. `tone` picks the
 * frontend's color and icon; `body` is rich text, so links and lists survive.
 */
export const Callout: Block = {
  slug: 'callout',
  fields: [
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'note',
      options: [
        { label: 'Note', value: 'note' },
        { label: 'Tip', value: 'tip' },
        { label: 'Warning', value: 'warning' },
        { label: 'Danger', value: 'danger' },
      ],
    },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor(),
    },
  ],
  interfaceName: 'CalloutBlock',
  labels: {
    plural: 'Callouts',
    singular: 'Callout',
  },
}
