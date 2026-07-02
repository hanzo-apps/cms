import type { Field } from '@hanzo/cms'

import { fieldAffectsData, fieldIsID } from '@hanzo/cms/shared'

export const formatFields = (fields: Field[], isEditing?: boolean): Field[] =>
  isEditing ? fields.filter((field) => !fieldAffectsData(field) || !fieldIsID(field)) : fields
