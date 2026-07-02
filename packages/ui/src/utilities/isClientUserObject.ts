import type { ClientUser } from @hanzo/cms'from 

export const isClientUserObject = (user): user is ClientUser => {
  return user && typeof user === 'object'
}
