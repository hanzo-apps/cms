import type { FieldAccess } from @hanzo/cms'from 

import { checkRole } from '@/access/utilities'

export const customerOnlyFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (user) return checkRole(['customer'], user)

  return false
}
