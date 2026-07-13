import { status as httpStatus } from 'http-status'

import type { CMSHandler } from '../../config/types.js'

import { getRequestCollection } from '../../utilities/getRequestEntity.js'
import { headersWithCors } from '../../utilities/headersWithCors.js'
import { generateCMSCookie } from '../cookies.js'
import { resetPasswordOperation } from '../operations/resetPassword.js'

export const resetPasswordHandler: CMSHandler = async (req) => {
  const collection = getRequestCollection(req)
  const { searchParams, t } = req
  const depth = searchParams.get('depth')

  const result = await resetPasswordOperation({
    collection,
    data: {
      password: typeof req.data?.password === 'string' ? req.data.password : '',
      token: typeof req.data?.token === 'string' ? req.data.token : '',
    },
    depth: depth ? Number(depth) : undefined,
    req,
  })

  const cookie = generateCMSCookie({
    collectionAuthConfig: collection.config.auth,
    cookiePrefix: req.cms.config.cookiePrefix,
    token: result.token!,
  })

  if (collection.config.auth.removeTokenFromResponses) {
    delete result.token
  }

  return Response.json(
    {
      message: t('authentication:passwordResetSuccessfully'),
      ...result,
    },
    {
      headers: headersWithCors({
        headers: new Headers({
          'Set-Cookie': cookie,
        }),
        req,
      }),
      status: httpStatus.OK,
    },
  )
}
