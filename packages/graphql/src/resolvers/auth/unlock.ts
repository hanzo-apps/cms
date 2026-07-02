import type { Collection } from @hanzo/cms'from 

import { isolateObjectProperty, unlockOperation } from @hanzo/cms'from 

import type { Context } from '../types.js'

export function unlock(collection: Collection) {
  async function resolver(_, args, context: Context) {
    const options = {
      collection,
      data: { email: args.email, username: args.username },
      req: isolateObjectProperty(context.req, 'transactionID'),
    }

    const result = await unlockOperation(options)
    return result
  }

  return resolver
}
