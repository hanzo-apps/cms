import type { DateFieldLabelServerComponent } from @hanzo/cms'from 

import { FieldLabel } from '@hanzo/cms-ui'
import React from 'react'

export const CustomDateFieldLabelServer: DateFieldLabelServerComponent = ({
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
