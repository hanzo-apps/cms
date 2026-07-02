import type { Access } from '@hanzo/cms'

import { checkRole } from './checkRole'

export const adminsAndUser: Access = ({ req: { user } }) => {
  if (user) {
    if (checkRole(['admin'], user)) {
      return true
    }

    return {
      id: { equals: user.id },
    }
  }

  return false
}
