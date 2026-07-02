import type { Field } from @hanzo/cms'from 

import { fieldAffectsData, fieldIsID } from @hanzo/cms'from 

export const formatFields = (fields: Field[], isEditing?: boolean): Field[] =>
  isEditing ? fields.filter((field) => !fieldAffectsData(field) || !fieldIsID(field)) : fields
