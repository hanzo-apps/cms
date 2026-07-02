import type { TextareaFieldServerComponent } from '@hanzo/cms'
import type React from 'react'

import { TextareaField } from '@hanzo/cms-ui'

export const CustomTextareaFieldServer: TextareaFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <TextareaField
      field={clientField}
      path={path}
      schemaPath={schemaPath}
      permissions={permissions}
    />
  )
}
