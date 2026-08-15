import { authorizeURL, beginAuth } from '@hanzo/cms-auth-iam'
import { getSafeRedirect } from '@hanzo/cms/shared'

import { OAUTH_COOKIE, adminClientID, clientID, redirectURI, serverURL } from '../shared.js'

/**
 * Start sign-in: mint PKCE + state, remember them, and hand the browser to IAM.
 *
 * The verifier never leaves the server — it rides in an httpOnly cookie that
 * only the callback reads, and it is what proves this client at the token
 * endpoint in place of a secret. Ten minutes is the whole useful life of an
 * authorization round-trip; a stale one is a dead end rather than a standing
 * credential.
 *
 * `?org=admin` selects the admin-org client. IAM refuses to mint a reserved-org
 * principal through a tenant app, so a platform operator genuinely cannot sign in
 * through the hanzo client — two registrations is what that rule requires, not a
 * convenience.
 */
export const GET = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams
  const isAdmin = params.get('org') === 'admin'
  const client = isAdmin ? adminClientID() : clientID()

  // The admin sends the path it wanted as ?redirect=. It is the one value a
  // stranger can put in front of a user, so it is confined to a path on this
  // origin by the framework's own check — the same one the built-in login view
  // applies, which already refuses the protocol-relative and backslash forms
  // that a hand-written comparison tends to miss.
  const returnTo = getSafeRedirect({
    fallbackTo: '/admin',
    redirectTo: params.get('redirect') ?? '',
  })

  const { challenge, state, verifier } = await beginAuth()

  const res = Response.redirect(
    authorizeURL({ challenge, clientId: client, redirectUri: redirectURI(), state }),
    302,
  )
  const headers = new Headers(res.headers)
  headers.append(
    'Set-Cookie',
    `${OAUTH_COOKIE}=${encodeURIComponent(JSON.stringify({ client, returnTo, state, verifier }))}` +
      `; Path=/auth; Max-Age=600; HttpOnly; SameSite=Lax${serverURL().startsWith('https:') ? '; Secure' : ''}`,
  )
  return new Response(null, { headers, status: 302 })
}
