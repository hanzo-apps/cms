'use client'

import type { LexicalInlineBlockClientProps } from '@hanzo/cms-richtext-lexical'

import { useFormFields } from '@hanzo/cms-ui'
import React from 'react'

export const LabelComponent: React.FC<LexicalInlineBlockClientProps> = () => {
  const key = useFormFields(([fields]) => fields.key)

  return <div>{(key?.value as string) ?? '<no value>'}yaya</div>
}
