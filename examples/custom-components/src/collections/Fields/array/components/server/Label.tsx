import type { ArrayFieldLabelServerComponent } from @hanzo/cms'from 

import { FieldLabel } from '@hanzo/cms-ui'
import React from 'react'

export const CustomArrayFieldLabelServer: ArrayFieldLabelServerComponent = ({
  clientField,
  path,
}) => {
  return (
    <FieldLabel
      label={clientField?.label || clientField?.name}
      required={clientField?.required}
      path={path}
    />
  )
}
