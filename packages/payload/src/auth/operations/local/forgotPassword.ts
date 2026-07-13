import type { AuthCollectionSlug, CMS, RequestContext } from '../../../index.js'
import type { CMSRequest } from '../../../types/index.js'
import type { Result } from '../forgotPassword.js'

import { APIError } from '../../../errors/index.js'
import { createLocalReq } from '../../../utilities/createLocalReq.js'
import { forgotPasswordOperation } from '../forgotPassword.js'

export type Options<TSlug extends AuthCollectionSlug> = {
  collection: TSlug
  context?: RequestContext
  data: {
    email: string
  }
  disableEmail?: boolean
  expiration?: number
  overrideAccess?: boolean
  req?: Partial<CMSRequest>
}

export async function forgotPasswordLocal<T extends AuthCollectionSlug>(
  cms: CMS,
  options: Options<T>,
): Promise<Result> {
  const {
    collection: collectionSlug,
    data,
    disableEmail,
    expiration,
    overrideAccess = true,
  } = options

  const collection = cms.collections[collectionSlug]

  if (!collection) {
    throw new APIError(
      `The collection with slug ${String(
        collectionSlug,
      )} can't be found. Forgot Password Operation.`,
    )
  }

  return forgotPasswordOperation({
    collection,
    data,
    disableEmail,
    expiration,
    overrideAccess,
    req: await createLocalReq(options, cms),
  }) as Promise<Result>
}
