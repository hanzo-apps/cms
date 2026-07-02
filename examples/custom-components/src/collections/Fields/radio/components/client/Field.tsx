'use client'
import type { RadioFieldClientComponent } from '@hanzo/cms'

import { RadioGroupField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomRadioFieldClient: RadioFieldClientComponent = (props) => {
  return <RadioGroupField {...props} />
}
