'use client'
import type { TextFieldClientComponent } from '@hanzo/cms'

import React from 'react'

export const UICustomClient: TextFieldClientComponent = ({
  field: {
    name,
    admin: { custom },
  },
}) => {
  return <div id={name}>{custom?.customValue}</div>
}
