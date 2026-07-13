import type { Auth } from '@hanzo/cms'

import { cookies as getCookies } from 'next/headers.js'
import { generateCMSCookie } from '@hanzo/cms'

type SetCMSAuthCookieArgs = {
  authConfig: Auth
  cookiePrefix: string
  token: string
}

export async function setCMSAuthCookie({
  authConfig,
  cookiePrefix,
  token,
}: SetCMSAuthCookieArgs): Promise<void> {
  const cookies = await getCookies()

  const cookieExpiration = authConfig.tokenExpiration
    ? new Date(Date.now() + authConfig.tokenExpiration)
    : undefined

  const cmsCookie = generateCMSCookie({
    collectionAuthConfig: authConfig,
    cookiePrefix,
    expires: cookieExpiration,
    returnCookieAsObject: true,
    token,
  })

  if (cmsCookie.value) {
    cookies.set(cmsCookie.name, cmsCookie.value, {
      domain: authConfig.cookies.domain,
      expires: cmsCookie.expires ? new Date(cmsCookie.expires) : undefined,
      httpOnly: true,
      sameSite: (typeof authConfig.cookies.sameSite === 'string'
        ? authConfig.cookies.sameSite.toLowerCase()
        : 'lax') as 'lax' | 'none' | 'strict',
      secure: authConfig.cookies.secure || false,
    })
  }
}
