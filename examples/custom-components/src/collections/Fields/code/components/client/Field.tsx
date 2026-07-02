'use client'
import type { CodeFieldClientComponent } from @hanzo/cms'from 

import { CodeField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomCodeFieldClient: CodeFieldClientComponent = (props) => {
  return <CodeField {...props} />
}
