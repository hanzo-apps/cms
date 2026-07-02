import type { Access } from @hanzo/cms'from 

export const loggedIn: Access = ({ req: { user } }) => {
  return Boolean(user)
}
