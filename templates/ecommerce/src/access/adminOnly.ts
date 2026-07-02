import type { Access } from '@hanzo/cms'

import { checkRole } from '@/access/utilities'

export const adminOnly: Access = ({ req: { user } }) => {
  if (user) return checkRole(['admin'], user)

  return false
}
