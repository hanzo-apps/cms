import type { EmailFieldServerComponent } from '@hanzo/cms'
import type React from 'react'

import { EmailField } from '@hanzo/cms-ui'

export const CustomEmailFieldServer: EmailFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <EmailField field={clientField} path={path} schemaPath={schemaPath} permissions={permissions} />
  )
}
