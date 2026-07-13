import type { Collection } from '@hanzo/cms'

import { generateExpiredCMSCookie, isolateObjectProperty, logoutOperation } from '@hanzo/cms'

import type { Context } from '../types.js'

export function logout(collection: Collection): any {
  async function resolver(_, args, context: Context) {
    const options = {
      allSessions: args.allSessions,
      collection,
      req: isolateObjectProperty(context.req, 'transactionID'),
    }

    const result = await logoutOperation(options)
    const expiredCookie = generateExpiredCMSCookie({
      collectionAuthConfig: collection.config.auth,
      config: context.req.cms.config,
      cookiePrefix: context.req.cms.config.cookiePrefix,
    })
    context.headers['Set-Cookie'] = expiredCookie
    return result
  }

  return resolver
}
