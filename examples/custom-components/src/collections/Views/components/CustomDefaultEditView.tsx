import type { ServerSideEditViewProps } from '@hanzo/cms'

import { Gutter } from '@hanzo/cms-ui'
import React from 'react'

export const CustomDefaultEditView: React.FC<ServerSideEditViewProps> = () => {
  return (
    <Gutter>
      <h1>Custom Default Edit View</h1>
    </Gutter>
  )
}
