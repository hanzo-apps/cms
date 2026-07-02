import type { DateFieldClient } from @hanzo/cms'from 

import type { DefaultFilterProps } from '../types.js'

export type DateFilterProps = {
  readonly field: DateFieldClient
  readonly value: Date | string
} & DefaultFilterProps
