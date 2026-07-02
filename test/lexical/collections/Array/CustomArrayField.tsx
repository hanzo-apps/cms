'use client'
import type { ArrayFieldClientComponent } from '@hanzo/cms'

import { ArrayField } from '@hanzo/cms-ui'

export const CustomArrayField: ArrayFieldClientComponent = (props) => {
  return (
    <div id="custom-array-field">
      <ArrayField {...props} />
    </div>
  )
}
