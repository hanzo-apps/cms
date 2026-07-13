import type { Collection } from '@hanzo/cms'

import { generateCMSCookie, isolateObjectProperty, resetPasswordOperation } from '@hanzo/cms'

import type { Context } from '../types.js'

export function resetPassword(collection: Collection): any {
  async function resolver(_, args, context: Context) {
    if (args.locale) {
      context.req.locale = args.locale
    }
    if (args.fallbackLocale) {
      context.req.fallbackLocale = args.fallbackLocale
    }

    const options = {
      api: 'GraphQL',
      collection,
      data: args,
      depth: 0,
      req: isolateObjectProperty(context.req, 'transactionID'),
    }

    const result = await resetPasswordOperation(options)
    const cookie = generateCMSCookie({
      collectionAuthConfig: collection.config.auth,
      cookiePrefix: context.req.cms.config.cookiePrefix,
      token: result.token,
    })
    context.headers['Set-Cookie'] = cookie

    if (collection.config.auth.removeTokenFromResponses) {
      delete result.token
    }

    return result
  }

  return resolver
}
