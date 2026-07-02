'use client'
import type { ClientField } from @hanzo/cms'from 

import { fieldAffectsData } from @hanzo/cms'from 

export const createNestedClientFieldPath = (parentPath: string, field: ClientField): string => {
  if (parentPath) {
    if (fieldAffectsData(field) && field.name) {
      return `${parentPath}.${field.name}`
    }
    return parentPath
  }

  if (fieldAffectsData(field)) {
    return field.name
  }

  return ''
}
