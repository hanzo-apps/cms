import type { Access } from '@hanzo/cms'

export const loggedIn: Access = ({ req: { user } }) => {
  return Boolean(user)
}
