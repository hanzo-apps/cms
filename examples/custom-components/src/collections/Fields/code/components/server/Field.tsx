import type { CodeFieldServerComponent } from @hanzo/cms'from 
import type React from 'react'

import { CodeField } from '@hanzo/cms-ui'

export const CustomCodeFieldServer: CodeFieldServerComponent = ({
  clientField,
  path,
  schemaPath,
  permissions,
}) => {
  return (
    <CodeField field={clientField} path={path} schemaPath={schemaPath} permissions={permissions} />
  )
}
