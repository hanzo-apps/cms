import type { GlobalAfterChangeHook } from @hanzo/cms'from 

import { revalidateTag } from 'next/cache'

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating footer`)

  revalidateTag('global_footer')

  return doc
}
