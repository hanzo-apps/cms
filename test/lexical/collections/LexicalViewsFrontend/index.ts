import type { CollectionConfig } from '@hanzo/cms'

import {
  BlocksFeature,
  type DefaultNodeTypes,
  FixedToolbarFeature,
  lexicalEditor,
  type SerializedBlockNode,
} from '@hanzo/cms-richtext-lexical'

import type { BannerBlock } from '../../payload-types.js'

import { lexicalViewsFrontendSlug } from '../../slugs.js'
import { DebugViewsJSXConverterFeature } from '../LexicalViews/viewsJSXConverter/server/index.js'
import { lexicalViewsFrontendBlocks } from './blocks.js'

export type LexicalViewsFrontendNodes = DefaultNodeTypes | SerializedBlockNode<BannerBlock>

export const LexicalViewsFrontend: CollectionConfig = {
  slug: lexicalViewsFrontendSlug,
  fields: [
    {
      name: 'customFrontendViews',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          BlocksFeature({
            blocks: lexicalViewsFrontendBlocks,
          }),
          DebugViewsJSXConverterFeature({ type: 'frontend' }),
        ],
        views: './collections/LexicalViewsFrontend/views.js#lexicalFrontendViews',
      }),
    },
  ],
  labels: {
    plural: 'Lexical Views Frontend',
    singular: 'Lexical Views Frontend',
  },
}
