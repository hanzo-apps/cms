import type { CollectionConfig } from '@hanzo/cms'

import { BlocksFeature, lexicalEditor } from '@hanzo/cms-richtext-lexical'

import { lexicalAutosaveBlockSlug } from '../../slugs.js'

export const LexicalAutosaveBlock: CollectionConfig = {
  slug: lexicalAutosaveBlockSlug,
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
    },
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: [
          BlocksFeature({
            blocks: [
              {
                slug: 'blockWithRichText',
                fields: [
                  {
                    name: 'nestedRichText',
                    type: 'richText',
                    editor: lexicalEditor(),
                  },
                ],
              },
            ],
          }),
        ],
      }),
    },
  ],
}
