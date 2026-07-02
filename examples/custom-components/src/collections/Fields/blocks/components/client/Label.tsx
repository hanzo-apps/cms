'use client'
import type { BlocksFieldLabelClientComponent } from '@hanzo/cms'

import { FieldLabel } from '@hanzo/cms-ui'
import React from 'react'

export const CustomBlocksFieldLabelClient: BlocksFieldLabelClientComponent = ({ field, path }) => {
  return <FieldLabel label={field?.label || field?.name} path={path} required={field?.required} />
}
