import type { Collection } from '@hanzo/cms'

import { generateCMSCookie, isolateObjectProperty, loginOperation } from '@hanzo/cms'

import type { Context } from '../types.js'

export function login(collection: Collection): any {
  async function resolver(_, args, context: Context) {
    const options = {
      collection,
      data: {
        email: args.email,
        password: args.password,
        username: args.username,
      },
      depth: 0,
      req: isolateObjectProperty(context.req, 'transactionID'),
    }

    const result = await loginOperation(options)
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
