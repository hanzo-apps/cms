'use client'

import type { DocumentViewClientProps } from @hanzo/cms'from 

import { DefaultEditView } from '@hanzo/cms-ui'
import React from 'react'

export const EditView: React.FC<DocumentViewClientProps> = (props) => {
  return <DefaultEditView {...props} />
}
