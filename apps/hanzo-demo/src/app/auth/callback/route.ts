import { exchangeCode } from '@hanzo/cms-auth-iam'
import { getCMS } from '@hanzo/cms'
import { generateCMSCookie, parseCookies } from '@hanzo/cms/shared'
import configPromise from '@payload-config'
import { timingSafeEqual } from 'crypto'

import { OAUTH_COOKIE, redirectURI, serverURL } from '../shared.js'

const sameString = (a: string, b: string): boolean => {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

/** Back to the login card. The reason is logged, never handed to the browser. */
const refuse = (reason: string): Response => {
  console.error(`[auth/callback] ${reason}`)
  return new Response(null, {
    headers: { Location: `${serverURL()}/admin/login?error=auth` },
    status: 302,
  })
}

/**
 * Finish sign-in: redeem the code and make the IAM token the session.
 *
 * The token is written into `cms-token` — `${cookiePrefix}-token`, the framework's
 * OWN session cookie — with the framework's own writer, so there is one session
 * mechanism rather than two. Everything downstream (the server-rendered admin,
 * /me, /refresh) already reads that cookie, and the IAM strategy verifies what it
 * finds against the JWKS.
 *
 * `cms-tenant` is dropped here: a new sign-in is a new session, and a tenant
 * chosen by whoever used this browser last is not this user's choice. The strategy
 * opens the fresh session on the home org.
 */
export const GET = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams

  // IAM reports a refused authorization on the redirect, not by failing it.
  const oauthError = params.get('error')
  if (oauthError) {
    return refuse(`IAM refused the authorization: ${oauthError}`)
  }

  const code = params.get('code')
  const state = params.get('state')
  if (!code || !state) {
    return refuse('callback carried no code or no state')
  }

  const stashed = parseCookies(request.headers).get(OAUTH_COOKIE)
  if (!stashed) {
    return refuse('no pending authorization for this browser')
  }

  let pending: { client?: string; returnTo?: string; state?: string; verifier?: string }
  try {
    pending = JSON.parse(decodeURIComponent(stashed))
  } catch {
    return refuse('pending authorization did not parse')
  }
  if (!pending.state || !pending.verifier || !pending.client) {
    return refuse('pending authorization was incomplete')
  }

  // The state binds this response to the request THIS browser started. Without
  // it, a code obtained anywhere could be delivered here and would be redeemed.
  if (!sameString(pending.state, state)) {
    return refuse('state did not match the pending authorization')
  }

  let accessToken: string
  try {
    const exchanged = await exchangeCode({
      clientId: pending.client,
      code,
      redirectUri: redirectURI(),
      verifier: pending.verifier,
    })
    accessToken = exchanged.accessToken
  } catch (err) {
    return refuse(`code exchange failed: ${(err as Error).message}`)
  }

  const cms = await getCMS({ config: configPromise })
  // Read the auth config off the sanitized config rather than out of the
  // collections map: the map is keyed by the literal slugs of THIS build, and
  // the admin's user slug is a configured string.
  const authConfig = cms.config.collections.find(({ slug }) => slug === cms.config.admin.user)?.auth
  if (!authConfig) {
    return refuse('the configured admin user collection carries no auth config')
  }

  // returnTo was already confined to this origin when it was stashed, and the
  // cookie holding it is httpOnly. Checked again on the way out anyway: this is
  // the value that moves a signed-in browser, so it is worth being sure of at
  // the moment it is used rather than only at the moment it was written.
  const home = new URL('/admin', serverURL())
  let back = home
  if (pending.returnTo) {
    try {
      const candidate = new URL(pending.returnTo, serverURL())
      if (candidate.origin === home.origin) {
        back = candidate
      }
    } catch {
      // unparseable → /admin
    }
  }

  const secure = serverURL().startsWith('https:')
  const headers = new Headers({ Location: back.toString() })
  headers.append(
    'Set-Cookie',
    generateCMSCookie({
      collectionAuthConfig: authConfig,
      cookiePrefix: cms.config.cookiePrefix,
      token: accessToken,
    }),
  )
  headers.append(
    'Set-Cookie',
    `${OAUTH_COOKIE}=; Path=/auth; Max-Age=0; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`,
  )
  headers.append('Set-Cookie', 'cms-tenant=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax')

  return new Response(null, { headers, status: 302 })
}
