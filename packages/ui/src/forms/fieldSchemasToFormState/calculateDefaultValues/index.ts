import type {
  Data,
  Field as FieldSchema,
  CMSRequest,
  SelectMode,
  SelectType,
  TypedUser,
} from '@hanzo/cms'

import { iterateFields } from './iterateFields.js'

type Args = {
  data: Data
  fields: FieldSchema[]
  id?: number | string
  locale: string | undefined
  req: CMSRequest
  select?: SelectType
  selectMode?: SelectMode
  siblingData: Data
  user: TypedUser
}

export const calculateDefaultValues = async ({
  id,
  data,
  fields,
  locale,
  req,
  select,
  selectMode,
  user,
}: Args): Promise<Data> => {
  await iterateFields({
    id,
    data,
    fields,
    locale,
    req,
    select,
    selectMode,
    siblingData: data,
    user,
  })

  return data
}
