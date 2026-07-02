import { Config } from '@/payload-types'
import type { CollectionSlug } from '@hanzo/cms'

export const extractID = <T extends Config['collections'][CollectionSlug]>(
  objectOrID: T | T['id'],
): T['id'] => {
  if (objectOrID && typeof objectOrID === 'object') return objectOrID.id

  return objectOrID
}
