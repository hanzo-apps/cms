import type { NumberFieldServerComponent } from '@hanzo/cms'
import type React from 'react'

import { NumberField } from '@hanzo/cms-ui'

export const CustomNumberFieldServer: NumberFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <NumberField
      field={clientField}
      path={path}
      schemaPath={schemaPath}
      permissions={permissions}
    />
  )
}
