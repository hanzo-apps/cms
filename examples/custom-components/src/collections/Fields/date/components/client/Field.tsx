'use client'
import type { DateFieldClientComponent } from '@hanzo/cms'

import { DateTimeField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomDateFieldClient: DateFieldClientComponent = (props) => {
  return <DateTimeField {...props} />
}
