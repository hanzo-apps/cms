import type {
  AuthCollectionSlug,
  AuthOperationsFromCollectionSlug,
  CMS,
  RequestContext,
} from '../../../index.js'
import type { CMSRequest } from '../../../types/index.js'

import { APIError } from '../../../errors/index.js'
import { createLocalReq } from '../../../utilities/createLocalReq.js'
import { unlockOperation } from '../unlock.js'

export type Options<TSlug extends AuthCollectionSlug> = {
  collection: TSlug
  context?: RequestContext
  data: AuthOperationsFromCollectionSlug<TSlug>['unlock']
  overrideAccess: boolean
  req?: Partial<CMSRequest>
}

export async function unlockLocal<TSlug extends AuthCollectionSlug>(
  cms: CMS,
  options: Options<TSlug>,
): Promise<boolean> {
  const { collection: collectionSlug, data, overrideAccess = true } = options

  const collection = cms.collections[collectionSlug]

  if (!collection) {
    throw new APIError(
      `The collection with slug ${String(collectionSlug)} can't be found. Unlock Operation.`,
    )
  }

  return unlockOperation<TSlug>({
    collection,
    data,
    overrideAccess,
    req: await createLocalReq(options, cms),
  })
}
