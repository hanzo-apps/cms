import type { CollectionAfterLogoutHook, CollectionRefreshHook } from '@hanzo/cms'

import { decodeJwt } from 'jose'

import { clearedTenantCookie } from './org.js'
import { iamToken } from './strategy.js'

/**
 * The refresh operation, answered with the IAM token the caller already holds.
 *
 * Without this the operation falls through to its default and signs a NEW token
 * with the CMS secret — an HS256 CMS JWT written into the session cookie, which
 * the IAM strategy then cannot verify against the JWKS. The session would end
 * silently on the next route change, and it would look like a session-length
 * problem rather than a signing one. So: return what IAM issued, unchanged.
 *
 * `setCookie: false` because nothing changed — the cookie already holds this
 * exact token, and its lifetime is the token's `exp`, not the cookie's.
 *
 * There is no refresh-token rotation. The access token's own lifetime is the
 * session (IAM `expireInHours: 8`); when it expires the admin sends the browser
 * to /auth/signin, which re-authenticates against IAM's own session with no
 * prompt if it is still live.
 *
 * With no IAM token in the request there is nothing to answer with, so the hook
 * declines and the operation takes its default path. The token that mints cannot
 * authenticate, so the next request is anonymous and the browser is sent back to
 * sign in — a dead end that recovers itself rather than a session that appears
 * to work.
 */
export const iamRefresh: CollectionRefreshHook = ({ args, user }) => {
  const token = iamToken(args.req.headers, args.req.cms)
  if (!token) {
    return
  }
  const exp = decodeJwt(token)?.exp
  if (typeof exp !== 'number') {
    return
  }
  return { exp, refreshedToken: token, setCookie: false, user }
}

/**
 * Drop the tenant selection when the session ends. The framework expires the
 * session cookie itself; this one is ours, and it outliving the session is what
 * would carry one person's chosen org into the next person's sign-in on the same
 * browser. Nothing is exposed by that — the tenant constraint still intersects
 * with the new user's own membership, so a foreign selection reads nothing — but
 * an empty list view with no explanation is the symptom, and it is avoidable.
 */
export const clearIAMCookies: CollectionAfterLogoutHook = ({ req }) => {
  const headers = req.responseHeaders ?? new Headers()
  headers.append('Set-Cookie', clearedTenantCookie())
  req.responseHeaders = headers
}
