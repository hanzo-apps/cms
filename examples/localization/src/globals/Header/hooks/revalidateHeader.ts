import type { GlobalAfterChangeHook } from @hanzo/cms'from 

import { revalidateTag } from 'next/cache'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating header`)

  revalidateTag('global_header')

  return doc
}
