import type { LexicalInlineBlockServerProps } from '@hanzo/cms-richtext-lexical'

import {
  InlineBlockContainer,
  InlineBlockEditButton,
  InlineBlockLabel,
  InlineBlockRemoveButton,
} from '@hanzo/cms-richtext-lexical/client'
import React from 'react'

export const BlockComponent: React.FC<LexicalInlineBlockServerProps> = () => {
  return (
    <InlineBlockContainer>
      <p>Test</p>
      <InlineBlockEditButton />
      <InlineBlockLabel />
      <InlineBlockRemoveButton />
    </InlineBlockContainer>
  )
}
