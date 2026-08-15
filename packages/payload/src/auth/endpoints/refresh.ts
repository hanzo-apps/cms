import { status as httpStatus } from 'http-status'

import type { CMSHandler } from '../../config/types.js'

import { getRequestCollection } from '../../utilities/getRequestEntity.js'
import { headersWithCors } from '../../utilities/headersWithCors.js'
import { generateCMSCookie } from '../cookies.js'
import { refreshOperation } from '../operations/refresh.js'

export const refreshHandler: CMSHandler = async (req) => {
  const collection = getRequestCollection(req)
  const { t } = req

  const headers = headersWithCors({
    headers: new Headers(),
    req,
  })

  const result = await refreshOperation({
    collection,
    req,
  })

  if (result.setCookie) {
    headers.set(
      'Set-Cookie',
      generateCMSCookie({
        collectionAuthConfig: collection.config.auth,
        cookiePrefix: req.cms.config.cookiePrefix,
        token: result.refreshedToken,
      }),
    )
  }

  // Whether a cookie was written and whether the body may carry the token are
  // different questions. Asking them as one meant a collection that refuses to
  // put tokens in responses still returned this one whenever the refresh left
  // the cookie alone — which is precisely what a refresh hook answering with the
  // token the caller already holds does.
  if (collection.config.auth.removeTokenFromResponses) {
    // @ts-expect-error - vestiges of when tsconfig was not strict. Feel free to improve
    delete result.refreshedToken
  }

  return Response.json(
    {
      message: t('authentication:tokenRefreshSuccessful'),
      ...result,
    },
    {
      headers,
      status: httpStatus.OK,
    },
  )
}
