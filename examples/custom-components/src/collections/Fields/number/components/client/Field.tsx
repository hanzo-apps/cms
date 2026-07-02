'use client'
import type { NumberFieldClientComponent } from '@hanzo/cms'

import { NumberField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomNumberFieldClient: NumberFieldClientComponent = (props) => {
  return <NumberField {...props} />
}
