import type { AuthCollectionSlug, CMS, RequestContext } from '../../../index.js'
import type { CMSRequest } from '../../../types/index.js'
import type { Result } from '../resetPassword.js'

import { APIError } from '../../../errors/index.js'
import { createLocalReq } from '../../../utilities/createLocalReq.js'
import { resetPasswordOperation } from '../resetPassword.js'

export type Options<TSlug extends AuthCollectionSlug> = {
  collection: TSlug
  context?: RequestContext
  data: {
    password: string
    token: string
  }
  overrideAccess: boolean
  req?: Partial<CMSRequest>
}

export async function resetPasswordLocal<TSlug extends AuthCollectionSlug>(
  cms: CMS,
  options: Options<TSlug>,
): Promise<Result> {
  const { collection: collectionSlug, data, overrideAccess } = options

  const collection = cms.collections[collectionSlug]

  if (!collection) {
    throw new APIError(
      `The collection with slug ${String(
        collectionSlug,
      )} can't be found. Reset Password Operation.`,
    )
  }

  const result = await resetPasswordOperation<TSlug>({
    collection,
    data,
    overrideAccess,
    req: await createLocalReq(options, cms),
  })

  if (collection.config.auth.removeTokenFromResponses) {
    delete result.token
  }

  return result
}
