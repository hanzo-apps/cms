import type { ArrayFieldServerComponent } from @hanzo/cms'from 
import type React from 'react'

import { ArrayField } from '@hanzo/cms-ui'

export const CustomArrayFieldServer: ArrayFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <ArrayField field={clientField} path={path} schemaPath={schemaPath} permissions={permissions} />
  )
}
