import type { TextFieldServerComponent } from @hanzo/cms'from 

import { TextField } from '@hanzo/cms-ui'

export const CustomTextField: TextFieldServerComponent = ({ clientField, path }) => {
  return (
    <div id="custom-text-field">
      <TextField field={clientField} path={path as string} />
    </div>
  )
}
