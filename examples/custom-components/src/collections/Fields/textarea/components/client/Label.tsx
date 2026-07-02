'use client'
import type { TextareaFieldLabelClientComponent } from '@hanzo/cms'

import { FieldLabel } from '@hanzo/cms-ui'
import React from 'react'

export const CustomTextareaFieldLabelClient: TextareaFieldLabelClientComponent = ({
  field,
  path,
}) => {
  return <FieldLabel label={field?.label || field?.name} path={path} required={field?.required} />
}
