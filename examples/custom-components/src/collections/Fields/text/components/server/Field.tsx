import type { TextFieldServerComponent } from '@hanzo/cms'
import type React from 'react'

import { TextField } from '@hanzo/cms-ui'

export const CustomTextFieldServer: TextFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <TextField field={clientField} path={path} schemaPath={schemaPath} permissions={permissions} />
  )
}
