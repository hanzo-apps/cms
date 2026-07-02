'use client'
import type { TextFieldClientComponent } from @hanzo/cms'from 

import { TextField, withCondition } from '@hanzo/cms-ui'
import React from 'react'

const MyField: TextFieldClientComponent = (props) => {
  return <TextField {...props} />
}

export default withCondition(MyField)
