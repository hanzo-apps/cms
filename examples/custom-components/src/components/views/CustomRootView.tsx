import type { AdminViewProps } from '@hanzo/cms'

import React from 'react'

export const CustomRootView: React.FC<AdminViewProps> = () => {
  return (
    <div>
      <h1>Custom Root View</h1>
      <br />
      <p>This is a completely standalone view.</p>
    </div>
  )
}
