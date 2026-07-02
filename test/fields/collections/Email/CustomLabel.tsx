'use client'

import type { EmailFieldClientComponent } from @hanzo/cms'from 

import React from 'react'

export const CustomLabel: EmailFieldClientComponent = ({ path }) => {
  return (
    <label className="custom-label" htmlFor={`field-${path?.replace(/\./g, '__')}`}>
      #label
    </label>
  )
}
