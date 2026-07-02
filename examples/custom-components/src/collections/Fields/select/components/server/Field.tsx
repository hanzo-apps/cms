import type { SelectFieldServerComponent } from @hanzo/cms'from 
import type React from 'react'

import { SelectField } from '@hanzo/cms-ui'

export const CustomSelectFieldServer: SelectFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <SelectField
      field={clientField}
      path={path}
      schemaPath={schemaPath}
      permissions={permissions}
    />
  )
}
