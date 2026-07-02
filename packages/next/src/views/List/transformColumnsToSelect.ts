import type { ColumnPreference, SelectType } from @hanzo/cms'from 

import { unflatten } from @hanzo/cms'from 

export const transformColumnsToSelect = (columns: ColumnPreference[]): SelectType => {
  const columnsSelect = columns.reduce((acc, column) => {
    if (column.active) {
      acc[column.accessor] = true
    }
    return acc
  }, {} as SelectType)

  return unflatten(columnsSelect)
}
