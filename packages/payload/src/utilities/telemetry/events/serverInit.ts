import type { CMS } from '../../../index.js'

import { sendEvent } from '../index.js'

export type ServerInitEvent = {
  type: 'server-init'
}

export const serverInit = (cms: CMS): void => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  sendEvent({
    event: {
      type: 'server-init',
    },
    cms,
  })
}
