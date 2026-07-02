import type { DateFieldServerComponent } from @hanzo/cms'from 
import type React from 'react'

import { DateTimeField } from '@hanzo/cms-ui'

export const CustomDateFieldServer: DateFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <DateTimeField
      field={clientField}
      path={path}
      schemaPath={schemaPath}
      permissions={permissions}
    />
  )
}
