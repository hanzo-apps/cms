import type { BlocksFieldServerComponent } from '@hanzo/cms'
import type React from 'react'

import { BlocksField } from '@hanzo/cms-ui'

export const CustomBlocksFieldServer: BlocksFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <BlocksField
      field={clientField}
      path={path}
      schemaPath={schemaPath}
      permissions={permissions}
    />
  )
}
