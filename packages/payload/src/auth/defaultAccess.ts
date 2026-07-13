import type { CMSRequest } from '../types/index.js'

export const defaultAccess = ({ req: { user } }: { req: CMSRequest }): boolean => Boolean(user)
