import type { RelationshipFieldLabelServerComponent } from '@hanzo/cms'

import { FieldLabel } from '@hanzo/cms-ui'
import React from 'react'

export const CustomRelationshipFieldLabelServer: RelationshipFieldLabelServerComponent = ({
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
