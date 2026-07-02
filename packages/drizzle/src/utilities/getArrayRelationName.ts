import type { ArrayField } from @hanzo/cms'from 

export const getArrayRelationName = ({
  field,
  path,
  tableName,
}: {
  field: ArrayField
  path: string
  tableName: string
}) => {
  if (field.dbName && path.length > 63) {
    return `_${tableName}`
  }

  return path
}
