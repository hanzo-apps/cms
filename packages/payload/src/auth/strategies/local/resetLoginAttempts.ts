import type { SanitizedCollectionConfig, TypeWithID } from '../../../collections/config/types.js'
import type { CMS } from '../../../index.js'
import type { CMSRequest } from '../../../types/index.js'

type Args = {
  collection: SanitizedCollectionConfig
  doc: Record<string, unknown> & TypeWithID
  cms: CMS
  req: CMSRequest
}

export const resetLoginAttempts = async ({
  collection,
  doc,
  cms,
  req,
}: Args): Promise<void> => {
  if (
    !('lockUntil' in doc && typeof doc.lockUntil === 'string') &&
    (!('loginAttempts' in doc) || doc.loginAttempts === 0)
  ) {
    return
  }
  await cms.db.updateOne({
    id: doc.id,
    collection: collection.slug,
    data: {
      lockUntil: null,
      loginAttempts: 0,
    },
    req,
    returning: false,
  })
}
