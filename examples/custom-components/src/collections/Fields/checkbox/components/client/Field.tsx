'use client'
import type { CheckboxFieldClientComponent } from '@hanzo/cms'

import { CheckboxField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomCheckboxFieldClient: CheckboxFieldClientComponent = (props) => {
  return <CheckboxField {...props} />
}
