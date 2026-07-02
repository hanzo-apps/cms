import type { AdminViewProps } from '@hanzo/cms'

import { MinimalTemplate } from '@hanzo/cms-next/templates'
import { Gutter } from '@hanzo/cms-ui'
import React from 'react'

export const CustomMinimalRootView: React.FC<AdminViewProps> = () => {
  return (
    <MinimalTemplate>
      <Gutter>
        <h1>Custom Minimal Root View</h1>
        <br />
        <p>This view uses the Minimal Template.</p>
      </Gutter>
    </MinimalTemplate>
  )
}
