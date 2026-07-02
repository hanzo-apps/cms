import type { TextFieldServerComponent } from '@hanzo/cms'
import type React from 'react'

import { TextField } from '@hanzo/cms-ui'

export const CustomTextFieldServer: TextFieldServerComponent = ({
  clientField,
  path,
  permissions,
  readOnly,
  schemaPath,
}) => {
  return (
    <TextField
      field={clientField}
      path={path}
      permissions={permissions}
      readOnly={readOnly}
      schemaPath={schemaPath}
    />
  )
}
