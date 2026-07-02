'use client'
import type { TextareaFieldClientComponent } from '@hanzo/cms'

import { TextareaField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomTextareaFieldClient: TextareaFieldClientComponent = (props) => {
  return <TextareaField {...props} />
}
