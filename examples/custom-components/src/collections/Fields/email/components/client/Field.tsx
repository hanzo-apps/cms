'use client'
import type { EmailFieldClientComponent } from @hanzo/cms'from 

import { EmailField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomEmailFieldClient: EmailFieldClientComponent = (props) => {
  return <EmailField {...props} />
}
