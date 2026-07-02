'use client'
import type { TextFieldClientComponent } from '@hanzo/cms'

import { useField } from '@hanzo/cms-ui'

export const RenderTracker: TextFieldClientComponent = ({ path }) => {
  useField({ path })
  console.count('Renders') // eslint-disable-line no-console
  return null
}
