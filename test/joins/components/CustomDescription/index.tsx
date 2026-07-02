'use client'
import type { FieldDescriptionClientComponent } from @hanzo/cms'from 

import React from 'react'

export const FieldDescriptionComponent: FieldDescriptionClientComponent = ({ path }) => {
  return <div className={`field-description-${path}`}>Component description: {path}</div>
}
