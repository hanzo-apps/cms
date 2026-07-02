import type { ServerSideEditViewProps } from @hanzo/cms'from 

import { Gutter } from '@hanzo/cms-ui'
import React from 'react'

export const CustomRootEditView: React.FC<ServerSideEditViewProps> = () => {
  return (
    <Gutter>
      <h1>Custom Root Edit View</h1>
    </Gutter>
  )
}
