'use client'
import type { JSONFieldClientComponent } from '@hanzo/cms'

import { JSONField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomJSONFieldClient: JSONFieldClientComponent = (props) => {
  return <JSONField {...props} />
}
