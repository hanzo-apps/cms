import type { Access } from @hanzo/cms'from 

import { checkRole } from './checkRole'

export const admins: Access = ({ req: { user } }) => checkRole(['admin'], user)
