import type { TextFieldServerComponent } from '@hanzo/cms'

import { TextField } from '@hanzo/cms-ui'

export const CustomTextField: TextFieldServerComponent = ({
  clientField,
  path,
  payload,
  schemaPath,
}) => {
  payload.logger.info('RENDERED CUSTOM SERVER COMPONENT')
  return <TextField field={clientField} path={path} schemaPath={schemaPath} />
}
