'use client'
import type { TextFieldClientComponent } from '@hanzo/cms'

import { TextField } from '@hanzo/cms-ui'

export const CustomTextField: TextFieldClientComponent = (props) => {
  return <TextField {...props} />
}
