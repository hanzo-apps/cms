import type { LexicalBlockServerProps } from '@hanzo/cms-richtext-lexical'

import { BlockCollapsible } from '@hanzo/cms-richtext-lexical/client'
import React from 'react'

export const BlockComponentRSC: React.FC<LexicalBlockServerProps> = (props) => {
  const { siblingData } = props

  return <BlockCollapsible>Data: {siblingData?.key ?? ''}</BlockCollapsible>
}
