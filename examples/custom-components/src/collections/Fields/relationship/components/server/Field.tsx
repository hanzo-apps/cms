import type { RelationshipFieldServerComponent } from @hanzo/cms'from 
import type React from 'react'

import { RelationshipField } from '@hanzo/cms-ui'

export const CustomRelationshipFieldServer: RelationshipFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <RelationshipField
      field={clientField}
      path={path}
      schemaPath={schemaPath}
      permissions={permissions}
    />
  )
}
