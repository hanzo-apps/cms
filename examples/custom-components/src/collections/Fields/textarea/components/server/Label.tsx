import type { TextareaFieldLabelServerComponent } from @hanzo/cms'from 

import { FieldLabel } from '@hanzo/cms-ui'
import React from 'react'

export const CustomTextareaFieldLabelServer: TextareaFieldLabelServerComponent = ({
  clientField,
  path,
}) => {
  return (
    <FieldLabel
      label={clientField?.label || clientField?.name}
      path={path}
      required={clientField?.required}
    />
  )
}
