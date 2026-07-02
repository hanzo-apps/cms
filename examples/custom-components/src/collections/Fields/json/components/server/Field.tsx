import type { JSONFieldServerComponent } from @hanzo/cms'from 
import type React from 'react'

import { JSONField } from '@hanzo/cms-ui'

export const CustomJSONFieldServer: JSONFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <JSONField field={clientField} path={path} schemaPath={schemaPath} permissions={permissions} />
  )
}
