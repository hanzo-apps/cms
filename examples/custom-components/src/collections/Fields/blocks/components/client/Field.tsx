'use client'
import type { BlocksFieldClientComponent } from @hanzo/cms'from 

import { BlocksField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomBlocksFieldClient: BlocksFieldClientComponent = (props) => {
  return <BlocksField {...props} />
}
