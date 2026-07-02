import type { CollectionConfig } from '@hanzo/cms'

import {
  ChecklistFeature,
  FixedToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  TreeViewFeature,
  UnorderedListFeature,
} from '@hanzo/cms-richtext-lexical'

import { lexicalListsFeatureSlug } from '../../slugs.js'

export const LexicalListsFeature: CollectionConfig = {
  slug: lexicalListsFeatureSlug,
  labels: {
    singular: 'Lexical Lists Features',
    plural: 'Lexical Lists Features',
  },
  fields: [
    {
      name: 'onlyOrderedList',
      type: 'richText',
      editor: lexicalEditor({
        features: [
          TreeViewFeature(),
          FixedToolbarFeature(),
          OrderedListFeature(),
          // UnorderedListFeature(),
          // ChecklistFeature(),
        ],
      }),
    },
  ],
}
