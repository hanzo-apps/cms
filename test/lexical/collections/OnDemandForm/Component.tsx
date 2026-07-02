'use client'

import type { DefaultNodeTypes } from '@hanzo/cms-richtext-lexical'
import type { JSONFieldClientComponent } from '@hanzo/cms'

import { buildEditorState, RenderLexical } from '@hanzo/cms-richtext-lexical/client'

import { lexicalFullyFeaturedSlug } from '../../slugs.js'

export const Component: JSONFieldClientComponent = () => {
  return (
    <div>
      Fully-Featured Component:
      <RenderLexical
        field={{ name: 'json' }}
        initialValue={buildEditorState<DefaultNodeTypes>({ text: 'defaultValue' })}
        schemaPath={`collection.${lexicalFullyFeaturedSlug}.richText`}
      />
    </div>
  )
}
