import type { CMS } from '../../../index.js'
import type { CMSRequest } from '../../../types/index.js'

import { sendEvent } from '../index.js'
import { oneWayHash } from '../oneWayHash.js'

export type AdminInitEvent = {
  domainID?: string
  type: 'admin-init'
  userID?: string
}

type Args = {
  headers: Request['headers']
  cms: CMS
  user: CMSRequest['user']
}
export const adminInit = ({ headers, cms, user }: Args): void => {
  const host = headers.get('host')

  let domainID: string
  let userID: string

  if (host) {
    domainID = oneWayHash(host, cms.secret)
  }

  if (user?.id) {
    userID = oneWayHash(String(user.id), cms.secret)
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  sendEvent({
    event: {
      type: 'admin-init',
      domainID: domainID!,
      userID: userID!,
    },
    cms,
  })
}
