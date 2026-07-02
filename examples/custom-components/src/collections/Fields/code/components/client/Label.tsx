'use client'
import type { CodeFieldLabelClientComponent } from @hanzo/cms'from 

import { FieldLabel } from '@hanzo/cms-ui'
import React from 'react'

export const CustomCodeFieldLabelClient: CodeFieldLabelClientComponent = ({ field, path }) => {
  return <FieldLabel label={field?.label || field?.name} path={path} required={field?.required} />
}
