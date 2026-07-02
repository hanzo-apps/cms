'use client'
import type { DateFieldLabelClientComponent } from '@hanzo/cms'

import { FieldLabel } from '@hanzo/cms-ui'
import React from 'react'

export const CustomDateFieldLabelClient: DateFieldLabelClientComponent = ({ field, path }) => {
  return <FieldLabel label={field?.label || field?.name} path={path} required={field?.required} />
}
