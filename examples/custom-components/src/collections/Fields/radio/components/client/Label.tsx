'use client'
import type { RadioFieldLabelClientComponent } from @hanzo/cms'from 

import { FieldLabel } from '@hanzo/cms-ui'
import React from 'react'

export const CustomRadioFieldLabelClient: RadioFieldLabelClientComponent = ({ field, path }) => {
  return <FieldLabel label={field?.label || field?.name} path={path} required={field?.required} />
}
