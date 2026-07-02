'use client'

import type { LexicalBlockClientProps } from '@hanzo/cms-richtext-lexical'

import {
  BlockCollapsible,
  BlockEditButton,
  BlockRemoveButton,
} from '@hanzo/cms-richtext-lexical/client'
import { useFormFields } from '@hanzo/cms-ui'
import React from 'react'

export const BlockComponent: React.FC<LexicalBlockClientProps> = () => {
  const key = useFormFields(([fields]) => fields.key)

  return (
    <BlockCollapsible>
      MY BLOCK COMPONENT. Value: {(key?.value as string) ?? '<no value>'}
      Edit: <BlockEditButton />
      <BlockRemoveButton />
    </BlockCollapsible>
  )
}
