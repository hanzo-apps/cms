'use client'
import type { TextFieldClientComponent } from '@hanzo/cms'

import { TextField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomClientField: TextFieldClientComponent = (props) => {
  return <TextField {...props} />
}
