'use client'
import type { PointFieldClientComponent } from '@hanzo/cms'

import { PointField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomPointFieldClient: PointFieldClientComponent = (props) => {
  return <PointField {...props} />
}
