import type { Access } from '@hanzo/cms'
import { User } from '../payload-types'

export const isSuperAdminAccess: Access = ({ req }): boolean => {
  return isSuperAdmin(req.user)
}

export const isSuperAdmin = (user: User | null): boolean => {
  return Boolean(user?.roles?.includes('super-admin'))
}
