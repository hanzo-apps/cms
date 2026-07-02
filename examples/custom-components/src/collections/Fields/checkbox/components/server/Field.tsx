import type { CheckboxFieldServerComponent } from '@hanzo/cms'
import type React from 'react'

import { CheckboxField } from '@hanzo/cms-ui'

export const CustomCheckboxFieldServer: CheckboxFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <CheckboxField
      field={clientField}
      path={path}
      schemaPath={schemaPath}
      permissions={permissions}
    />
  )
}
