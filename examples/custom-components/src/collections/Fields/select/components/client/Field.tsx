'use client'
import type { SelectFieldClientComponent } from @hanzo/cms'from 

import { SelectField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomSelectFieldClient: SelectFieldClientComponent = (props) => {
  return <SelectField {...props} />
}
