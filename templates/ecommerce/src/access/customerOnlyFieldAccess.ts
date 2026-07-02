import type { FieldAccess } from '@hanzo/cms'

import { checkRole } from '@/access/utilities'

export const customerOnlyFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (user) return checkRole(['customer'], user)

  return false
}
