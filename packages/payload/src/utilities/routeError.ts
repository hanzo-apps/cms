import { status as httpStatus } from 'http-status'

import type { Collection } from '../collections/config/types.js'
import type { ErrorResult, SanitizedConfig } from '../config/types.js'
import type { CMSRequest } from '../types/index.js'

import { APIError } from '../errors/APIError.js'
import { getCMS } from '../index.js'
import { formatErrors } from './formatErrors.js'
import { headersWithCors } from './headersWithCors.js'
import { isErrorPublic } from './isErrorPublic.js'
import { logError } from './logError.js'
import { mergeHeaders } from './mergeHeaders.js'

export const routeError = async ({
  collection,
  config: configArg,
  err,
  req: incomingReq,
}: {
  collection?: Collection
  config: Promise<SanitizedConfig> | SanitizedConfig
  err: APIError
  req: CMSRequest | Request
}): Promise<Response> => {
  if ('cmsInitError' in err && err.cmsInitError === true) {
    // do not attempt initializing CMS if the error is due to a failed initialization. Otherwise,
    // it will cause an infinite loop of initialization attempts and endless error responses, without
    // actually logging the error, as the error logging code will never be reached.
    console.error(err)
    return Response.json(
      {
        message: 'There was an error initializing CMS',
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR },
    )
  }

  let cms = incomingReq && 'cms' in incomingReq && incomingReq?.cms

  if (!cms) {
    try {
      cms = await getCMS({ config: configArg, cron: true })
    } catch (ignore) {
      return Response.json(
        {
          message: 'There was an error initializing CMS',
        },
        { status: httpStatus.INTERNAL_SERVER_ERROR },
      )
    }
  }

  let response = formatErrors(err)

  let status = err.status || httpStatus.INTERNAL_SERVER_ERROR

  logError({ err, cms })

  const req = incomingReq as CMSRequest

  req.cms = cms
  const headers = headersWithCors({
    headers: new Headers(),
    req,
  })

  const { config } = cms

  // Internal server errors can contain anything, including potentially sensitive data.
  // Therefore, error details will be hidden from the response unless `config.debug` is `true`
  if (!isErrorPublic(err, config)) {
    response = formatErrors(new APIError('Something went wrong.'))
  }

  if (config.debug && config.debug === true) {
    response.stack = err.stack
  }

  if (collection) {
    await collection.config.hooks.afterError?.reduce(async (promise, hook) => {
      await promise

      const result = await hook({
        collection: collection.config,
        context: req.context,
        error: err,
        req,
        result: response,
      })

      if (result) {
        response = (result.response as ErrorResult) || response
        status = result.status || status
      }
    }, Promise.resolve())
  }

  await config.hooks.afterError?.reduce(async (promise, hook) => {
    await promise

    const result = await hook({
      collection: collection?.config,
      context: req.context,
      error: err,
      req,
      result: response,
    })

    if (result) {
      response = (result.response as ErrorResult) || response
      status = result.status || status
    }
  }, Promise.resolve())

  return Response.json(response, {
    headers: req.responseHeaders ? mergeHeaders(req.responseHeaders, headers) : headers,
    status,
  })
}
