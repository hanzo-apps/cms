import type { Access } from '@hanzo/cms'

import { checkRole } from '@/access/utilities'

export const adminOrPublishedStatus: Access = ({ req: { user } }) => {
  if (user && checkRole(['admin'], user)) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
