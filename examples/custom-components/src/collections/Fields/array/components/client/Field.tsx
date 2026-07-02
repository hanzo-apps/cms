'use client'
import type { ArrayFieldClientComponent } from '@hanzo/cms'

import { ArrayField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomArrayFieldClient: ArrayFieldClientComponent = (props) => {
  return <ArrayField {...props} />
}
