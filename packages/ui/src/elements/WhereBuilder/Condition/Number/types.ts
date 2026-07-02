import type { NumberFieldClient } from '@hanzo/cms'

import type { DefaultFilterProps } from '../types.js'

export type NumberFilterProps = {
  readonly field: NumberFieldClient
  readonly onChange: (e: string) => void
  readonly value: number | number[]
} & DefaultFilterProps
