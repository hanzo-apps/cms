import { status as httpStatus } from 'http-status'

import type { CMSHandler } from '../../config/types.js'

import { getRequestGlobal } from '../../utilities/getRequestEntity.js'
import { headersWithCors } from '../../utilities/headersWithCors.js'
import { docAccessOperation } from '../operations/docAccess.js'

export const docAccessHandler: CMSHandler = async (req) => {
  const globalConfig = getRequestGlobal(req)
  const result = await docAccessOperation({
    data: req.data,
    globalConfig,
    req,
  })

  return Response.json(result, {
    headers: headersWithCors({
      headers: new Headers(),
      req,
    }),
    status: httpStatus.OK,
  })
}
