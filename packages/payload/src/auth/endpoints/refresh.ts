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
    const cookie = generateCMSCookie({
      collectionAuthConfig: collection.config.auth,
      cookiePrefix: req.cms.config.cookiePrefix,
      token: result.refreshedToken,
    })

    if (collection.config.auth.removeTokenFromResponses) {
      // @ts-expect-error - vestiges of when tsconfig was not strict. Feel free to improve
      delete result.refreshedToken
    }

    headers.set('Set-Cookie', cookie)
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
