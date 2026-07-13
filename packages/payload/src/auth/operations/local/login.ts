import type {
  AuthCollectionSlug,
  AuthOperationsFromCollectionSlug,
  CMS,
  RequestContext,
} from '../../../index.js'
import type { CMSRequest } from '../../../types/index.js'
import type { LoginResult } from '../login.js'

import { APIError } from '../../../errors/index.js'
import { createLocalReq } from '../../../utilities/createLocalReq.js'
import { loginOperation } from '../login.js'

export type Options<TSlug extends AuthCollectionSlug> = {
  collection: TSlug
  context?: RequestContext
  data: AuthOperationsFromCollectionSlug<TSlug>['login']
  depth?: number
  fallbackLocale?: string
  locale?: string
  overrideAccess?: boolean
  req?: Partial<CMSRequest>
  showHiddenFields?: boolean
  trash?: boolean
}

export async function loginLocal<TSlug extends AuthCollectionSlug>(
  cms: CMS,
  options: Options<TSlug>,
): Promise<LoginResult<TSlug>> {
  const {
    collection: collectionSlug,
    data,
    depth,
    overrideAccess = true,
    showHiddenFields,
  } = options

  const collection = cms.collections[collectionSlug]

  if (!collection) {
    throw new APIError(
      `The collection with slug ${String(collectionSlug)} can't be found. Login Operation.`,
    )
  }

  const args = {
    collection,
    data,
    depth,
    overrideAccess,
    req: await createLocalReq(options, cms),
    showHiddenFields,
  }

  const result = await loginOperation<TSlug>(args)

  if (collection.config.auth.removeTokenFromResponses) {
    delete result.token
  }

  return result
}
