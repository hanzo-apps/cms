'use client'
import type { TextFieldClientComponent } from @hanzo/cms'from 

import { TextField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomTextFieldClient: TextFieldClientComponent = (props) => {
  return <TextField {...props} />
}
