import type { GraphQLError, GraphQLFormattedError } from 'graphql'
import type { APIError, CMS, CMSRequest, SanitizedConfig } from '@hanzo/cms'

import { configToSchema } from '@hanzo/cms-graphql'
import { createHandler } from 'graphql-http/lib/use/fetch'
import { status as httpStatus } from 'http-status'
import {
  addDataAndFileToRequest,
  addLocalesToRequestFromData,
  createCMSRequest,
  headersWithCors,
  logError,
  mergeHeaders,
} from '@hanzo/cms'

const handleError = async ({
  err,
  cms,
  req,
}: {
  err: GraphQLError
  cms: CMS
  req: CMSRequest
}): Promise<GraphQLFormattedError> => {
  const status = (err.originalError as APIError).status || httpStatus.INTERNAL_SERVER_ERROR
  let errorMessage = err.message
  logError({ err, cms })

  // Internal server errors can contain anything, including potentially sensitive data.
  // Therefore, error details will be hidden from the response unless `config.debug` is `true`
  if (!cms.config.debug && status === httpStatus.INTERNAL_SERVER_ERROR) {
    errorMessage = 'Something went wrong.'
  }

  let response: GraphQLFormattedError = {
    extensions: {
      name: err?.originalError?.name || undefined,
      data: (err && err.originalError && (err.originalError as APIError).data) || undefined,
      stack: cms.config.debug ? err.stack : undefined,
      statusCode: status,
    },
    locations: err.locations,
    message: errorMessage,
    path: err.path,
  }

  await cms.config.hooks.afterError?.reduce(async (promise, hook) => {
    await promise

    const result = await hook({
      context: req.context,
      error: err,
      graphqlResult: response,
      req,
    })

    if (result) {
      response = result.graphqlResult || response
    }
  }, Promise.resolve())

  return response
}

let cached = global._cms_graphql

if (!cached) {
  cached = global._cms_graphql = { graphql: null, promise: null }
}

export const getGraphql = async (config: Promise<SanitizedConfig> | SanitizedConfig) => {
  if (process.env.NODE_ENV === 'development') {
    cached = global._cms_graphql = { graphql: null, promise: null }
  }

  if (cached.graphql) {
    return cached.graphql
  }

  if (!cached.promise) {
    const resolvedConfig = await config
    cached.promise = new Promise((resolve) => {
      const schema = configToSchema(resolvedConfig)
      resolve(cached.graphql || schema)
    })
  }

  try {
    cached.graphql = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.graphql
}

export const POST =
  (config: Promise<SanitizedConfig> | SanitizedConfig) => async (request: Request) => {
    const originalRequest = request.clone()
    const req = await createCMSRequest({
      canSetHeaders: true,
      config,
      request,
    })

    await addDataAndFileToRequest(req)
    addLocalesToRequestFromData(req)

    const { schema, validationRules } = await getGraphql(config)

    const { cms } = req

    const headers = {}
    const apiResponse = await createHandler({
      context: { headers, req },
      onOperation: async (request, args, result) => {
        const response =
          typeof cms.extensions === 'function'
            ? await cms.extensions({
                args,
                req: request,
                result,
              })
            : result
        if (response.errors) {
          const errors = (await Promise.all(
            result.errors.map((error) => {
              return handleError({ err: error, cms, req })
            }),
          )) as GraphQLError[]
          // errors type should be FormattedGraphQLError[] but onOperation has a return type of ExecutionResult instead of FormattedExecutionResult
          return { ...response, errors }
        }
        return response
      },
      schema,
      validationRules: (_, args, defaultRules) => defaultRules.concat(validationRules(args)),
    })(originalRequest)

    const resHeaders = headersWithCors({
      headers: new Headers(apiResponse.headers),
      req,
    })

    for (const key in headers) {
      resHeaders.append(key, headers[key])
    }

    return new Response(apiResponse.body, {
      headers: req.responseHeaders ? mergeHeaders(req.responseHeaders, resHeaders) : resHeaders,
      status: apiResponse.status,
    })
  }
