import type { Document, CMSRequest, SanitizedGlobalConfig } from '@hanzo/cms'

import { isolateObjectProperty, restoreVersionOperationGlobal } from '@hanzo/cms'

import type { Context } from '../types.js'

type Resolver = (
  _: unknown,
  args: {
    draft?: boolean
    id: number | string
  },
  context: {
    req: CMSRequest
  },
) => Promise<Document>
export function restoreVersion(globalConfig: SanitizedGlobalConfig): Resolver {
  return async function resolver(_, args, context: Context) {
    const options = {
      id: args.id,
      depth: 0,
      draft: args.draft,
      globalConfig,
      req: isolateObjectProperty(context.req, 'transactionID'),
    }

    const result = await restoreVersionOperationGlobal(options)
    return result
  }
}
