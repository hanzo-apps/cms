/**
 * Hanzo IAM, locally: one signing key, the JWKS that publishes it, and a mint
 * for the tokens IAM signs. Opening it points HANZO_IAM_* at the local key set,
 * so the strategy under proof runs unaltered — it fetches a JWKS, verifies an
 * RS256 signature against it, and checks the issuer and the audience.
 *
 * Open it BEFORE importing the CMS config: the strategy reads those variables
 * when it is constructed, and importing the config constructs it.
 *
 * Signing is `node:crypto` rather than jose because the app cannot resolve jose
 * — it belongs to @hanzo/cms-auth-iam, which is where the verifying half runs.
 */
import type { KeyObject } from 'node:crypto'

import { createSign, generateKeyPairSync } from 'node:crypto'
import { createServer } from 'node:http'

/**
 * The claims Hanzo IAM signs. `owner` is the home org — the one `isSuperAdmin`
 * reads — and `orgs` is the whole tenancy set, home first.
 */
export type Claims = {
  aud?: string | string[]
  displayName?: string
  email?: string
  exp?: number
  name?: string
  orgs?: { org: string; role?: 'admin' | 'member' | 'owner' }[]
  owner?: string
  sub: string
}

/** Both keys sign under this id, so a forgery fails on its signature, not on key lookup. */
const KID = 'local-iam'

const b64 = (value: string) => Buffer.from(value).toString('base64url')

export const openIAM = async (audience = 'hanzo-cms') => {
  const signing = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const stranger = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const { e, kty, n } = signing.publicKey.export({ format: 'jwk' }) as {
    e: string
    kty: string
    n: string
  }
  const jwks = JSON.stringify({ keys: [{ alg: 'RS256', e, kid: KID, kty, n, use: 'sig' }] })

  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(jwks)
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
  // Nothing waits on this server, so it must not hold the process open.
  server.unref()

  const issuer = `http://127.0.0.1:${(server.address() as { port: number }).port}`

  process.env.HANZO_IAM_AUDIENCE = audience
  process.env.HANZO_IAM_ISSUER = issuer
  process.env.HANZO_IAM_JWKS_URI = `${issuer}/v1/iam/.well-known/jwks`

  const sign = (key: KeyObject, claims: Claims) => {
    const now = Math.floor(Date.now() / 1000)
    const head = b64(JSON.stringify({ alg: 'RS256', kid: KID, typ: 'JWT' }))
    const body = b64(
      JSON.stringify({ aud: audience, exp: now + 3600, iat: now, iss: issuer, ...claims }),
    )
    return `${head}.${body}.${createSign('RSA-SHA256').update(`${head}.${body}`).sign(key, 'base64url')}`
  }

  return {
    audience,
    /** Signed by a key the JWKS never publishes. */
    forge: (claims: Claims) => sign(stranger.privateKey, claims),
    issuer,
    /** Signed by the key the JWKS publishes. */
    mint: (claims: Claims) => sign(signing.privateKey, claims),
  }
}
