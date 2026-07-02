import type { TextFieldServerComponent } from '@hanzo/cms'

import { TextField } from '@hanzo/cms-ui'

export const CustomTextField: TextFieldServerComponent = ({ clientField, path }) => {
  return (
    <div id="custom-text-field">
      <TextField field={clientField} path={path} />
    </div>
  )
}
