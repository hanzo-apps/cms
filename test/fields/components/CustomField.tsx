'use client'

import type { TextFieldClientComponent } from '@hanzo/cms'

import React from 'react'

export const CustomField: TextFieldClientComponent = ({ schemaPath }) => {
  return <div id="custom-field-schema-path">{schemaPath}</div>
}
