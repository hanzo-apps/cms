'use client'
import type { TextFieldClientComponent } from '@hanzo/cms'

import { TextField } from '@hanzo/cms-ui'
import React from 'react'

const CustomFieldWithField: TextFieldClientComponent = (props) => {
  return <TextField {...props} />
}

export default CustomFieldWithField
