import type { CollectionConfig } from '@hanzo/cms'

import { DebugJsxConverterFeature, lexicalEditor } from '@hanzo/cms-richtext-lexical'

import { lexicalJSXConverterSlug } from '../../slugs.js'

export const LexicalJSXConverter: CollectionConfig = {
  slug: lexicalJSXConverterSlug,
  fields: [
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, DebugJsxConverterFeature()],
      }),
    },
  ],
}
