import type { DayPickerProps, SharedProps, TimePickerProps } from @hanzo/cms'from 

export type Props = {
  id?: string
  onChange?: (val: Date) => void
  placeholder?: string
  readOnly?: boolean
  value?: Date | string
} & DayPickerProps &
  SharedProps &
  TimePickerProps
