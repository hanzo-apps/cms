import type { PointFieldServerComponent } from '@hanzo/cms'
import type React from 'react'

import { PointField } from '@hanzo/cms-ui'

export const CustomPointFieldServer: PointFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <PointField field={clientField} path={path} schemaPath={schemaPath} permissions={permissions} />
  )
}
