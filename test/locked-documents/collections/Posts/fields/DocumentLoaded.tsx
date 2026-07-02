'use client'
import type { TextFieldClientProps } from @hanzo/cms'from 

import { DatePicker, FieldLabel, useField } from '@hanzo/cms-ui'
import { type FunctionComponent, useEffect, useRef } from 'react'

export const DocumentLoaded: FunctionComponent<TextFieldClientProps> = ({ field: label }) => {
  const field = useField<Date>({
    path: 'documentLoaded',
  })
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current || field.formInitializing) {
      return
    }
    hasRun.current = true

    field.setValue(new Date().toISOString())
  }, [field])

  return (
    <div
      style={{
        marginBottom: '20px',
      }}
    >
      <FieldLabel field={label} />
      <DatePicker displayFormat="yyyy-MM-dd hh:mm:ss" readOnly={true} value={field.value} />
    </div>
  )
}
