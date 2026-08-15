import { generatePKCEChallenge, generateState } from '@hanzo/iam'

/**
 * The OIDC half of IAM auth: the three URLs and the one exchange that turn a
 * browser at /admin into an IAM access token. Server-only — the code exchange
 * and the verifier never reach the client.
 *
 * `hanzo-cms` is a PUBLIC client (IAM `type: spa`), so there is no client secret
 * anywhere in this package: the token endpoint skips client authentication when
 * the code carries a PKCE challenge, and the verifier is what proves the caller.
 * That is what removes the machine credential this deployment would otherwise
 * need, and with it the KMS dependency.
 *
 * Paths are IAM's own (hanzoai/iam internal/oidc/oidc.go). IAM answers 200
 * text/html for any path it does not serve, so a wrong path here does NOT 404 —
 * it returns a login page that fails to parse as JSON.
 */

const DEFAULT_ISSUER = 'https://hanzo.id'

/** The IAM issuer this deployment trusts. One resolution, read by every caller. */
export const iamIssuer = (): string =>
  (process.env.HANZO_IAM_ISSUER || DEFAULT_ISSUER).replace(/\/$/, '')

const PATH_AUTHORIZE = '/v1/iam/oauth/authorize'
const PATH_TOKEN = '/v1/iam/oauth/token'
const PATH_LOGOUT = '/v1/iam/oauth/logout'

/** A fresh PKCE pair and state. Never hand-rolled — this is IAM's own generator. */
export const beginAuth = async (): Promise<{
  challenge: string
  state: string
  verifier: string
}> => {
  const { codeChallenge, codeVerifier } = await generatePKCEChallenge()
  return { challenge: codeChallenge, state: generateState(), verifier: codeVerifier }
}

/** Where the browser goes to sign in. */
export const authorizeURL = (args: {
  challenge: string
  clientId: string
  redirectUri: string
  state: string
}): string => {
  const url = new URL(iamIssuer() + PATH_AUTHORIZE)
  url.searchParams.set('client_id', args.clientId)
  url.searchParams.set('redirect_uri', args.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid profile email')
  url.searchParams.set('state', args.state)
  url.searchParams.set('code_challenge', args.challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}

/**
 * Redeem the code for an access token. Form body, no client authentication —
 * the verifier is the credential.
 */
export const exchangeCode = async (args: {
  clientId: string
  code: string
  redirectUri: string
  verifier: string
}): Promise<{ accessToken: string; expiresIn?: number }> => {
  const body = new URLSearchParams({
    client_id: args.clientId,
    code: args.code,
    code_verifier: args.verifier,
    grant_type: 'authorization_code',
    redirect_uri: args.redirectUri,
  })

  const res = await fetch(iamIssuer() + PATH_TOKEN, {
    body,
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  // Read as text first: a path IAM does not serve answers 200 text/html, and
  // `res.json()` on that throws a syntax error that names nothing useful.
  const raw = await res.text()
  let parsed: { access_token?: string; error?: string; expires_in?: number }
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`IAM token endpoint returned ${res.status} and a non-JSON body`)
  }
  if (!res.ok || !parsed.access_token) {
    throw new Error(
      `IAM token exchange failed (${res.status}): ${parsed.error ?? 'no access_token'}`,
    )
  }
  return { accessToken: parsed.access_token, expiresIn: parsed.expires_in }
}

/**
 * Where the browser goes to sign out. Ends the IAM session as well as the local
 * one — dropping the cookie alone leaves the IdP session alive, and the next
 * /admin visit silently signs the same person straight back in.
 *
 * `origin` is the deployment's OWN serverURL, never a request header, and
 * `returnPath` is resolved against it and then CHECKED: a value that lands on any
 * other origin falls back to /admin. Pattern-matching the input alone is not
 * enough — WHATWG URL folds a backslash onto a slash for http(s), so `/\evil.com`
 * parses as the host `evil.com` while reading as a path. Comparing the resolved
 * origin is what actually closes that, so the check is on the OUTPUT.
 */
export const signOutURL = (args: { origin: string; returnPath?: string }): string => {
  const home = new URL('/admin', args.origin)
  let back = home
  if (args.returnPath) {
    try {
      const candidate = new URL(args.returnPath, args.origin)
      if (candidate.origin === home.origin) {
        back = candidate
      }
    } catch {
      // unparseable → home
    }
  }
  const url = new URL(iamIssuer() + PATH_LOGOUT)
  url.searchParams.set('post_logout_redirect_uri', back.toString())
  return url.toString()
}
