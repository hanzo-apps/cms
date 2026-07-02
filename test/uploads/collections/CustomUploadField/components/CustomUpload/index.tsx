import type { PayloadServerReactComponent, SanitizedCollectionConfig } from '@hanzo/cms'

import React from 'react'

import { CustomUploadClient } from './index.client.js'

export const CustomUploadRSC: PayloadServerReactComponent<
  SanitizedCollectionConfig['admin']['components']['edit']['Upload']
> = () => {
  return (
    <div>
      <h2>This text was rendered on the server</h2>
      <CustomUploadClient />
    </div>
  )
}
