import type { ServerSideEditViewProps } from '@hanzo/cms'

import { Gutter } from '@hanzo/cms-ui'
import React from 'react'

export const CustomTabEditView: React.FC<ServerSideEditViewProps> = () => {
  return (
    <Gutter>
      <h1>Custom Tab Edit View</h1>
    </Gutter>
  )
}
