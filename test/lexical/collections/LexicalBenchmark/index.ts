import type { Block, CollectionConfig } from '@hanzo/cms'

import { BlocksFeature, FixedToolbarFeature, lexicalEditor } from '@hanzo/cms-richtext-lexical'

import { lexicalBenchmarkSlug } from '../../slugs.js'

const benchmarkBlocks: Block[] = Array.from({ length: 30 }, (_, i) => ({
  slug: `benchBlock${i + 1}`,
  fields: [
    { name: 'title', type: 'text' as const },
    { name: 'content', type: 'textarea' as const },
  ],
}))

export const LexicalBenchmark: CollectionConfig = {
  slug: lexicalBenchmarkSlug,
  labels: {
    singular: 'Lexical Benchmark',
    plural: 'Lexical Benchmarks',
  },
  fields: [
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          BlocksFeature({
            blocks: benchmarkBlocks,
          }),
        ],
      }),
    },
  ],
}
