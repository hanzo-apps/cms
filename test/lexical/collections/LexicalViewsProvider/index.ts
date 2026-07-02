import type { CollectionConfig } from @hanzo/cms'from 

import { BlocksFeature, lexicalEditor } from '@hanzo/cms-richtext-lexical'

import { lexicalViewsProviderSlug } from '../../slugs.js'
import { lexicalViewsProviderBlocks } from './blocks.js'

export const LexicalViewsProvider: CollectionConfig = {
  slug: lexicalViewsProviderSlug,
  fields: [
    {
      type: 'group',
      name: 'viewProviderWrapper',
      admin: {
        hideGutter: true,
        components: {
          Field:
            './collections/LexicalViewsProvider/ViewProviderGroupWrapper.js#ViewProviderGroupWrapper',
        },
      },
      fields: [
        {
          name: 'richTextField',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => [
              ...defaultFeatures,
              BlocksFeature({
                blocks: lexicalViewsProviderBlocks,
              }),
            ],
            views: './collections/LexicalViewsProvider/views.js#lexicalProviderViews',
          }),
        },
      ],
    },
  ],
  labels: {
    plural: 'Lexical Views Provider',
    singular: 'Lexical Views Provider',
  },
}
