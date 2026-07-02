'use client'

import type { LexicalBlockLabelClientProps } from '@hanzo/cms-richtext-lexical'

import { useFormFields } from '@hanzo/cms-ui'
import React from 'react'

export const LabelComponent: React.FC<LexicalBlockLabelClientProps> = () => {
  const key = useFormFields(([fields]) => fields.key)

  return <div>{(key?.value as string) ?? '<no value>'}yaya</div>
}
