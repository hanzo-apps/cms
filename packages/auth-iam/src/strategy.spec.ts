import { describe, expect, it } from 'vitest'

import * as authIam from './index.js'
import { hanzoIAMStrategy } from './strategy.js'

/**
 * Tenancy security contract for the Hanzo IAM SSO strategy.
 *
 * The org (== tenant) is derived ONLY from a cryptographically-verified token.
 * These guard the two properties an attacker would probe:
 *   1. fail-secure — no token / bad token → anonymous, never provisions.
 *   2. one identity path — the header-trust proxy strategy (which let a
 *      shared-secret holder forge `x-org-id` and read ANY org) is GONE.
 */

// A non-resolvable JWKS so an accidental fetch fails locally instead of hitting
// hanzo.id — every case below must reject BEFORE any network call anyway.
const authenticate = (headers: Record<string, string>) =>
  hanzoIAMStrategy({ jwksUri: 'http://127.0.0.1:9/jwks' }).authenticate({
    canSetHeaders: true,
    headers: new Headers(headers),
    payload: {} as never,
  } as never)

describe('hanzoIAMStrategy — fail-secure, org from a validated token only', () => {
  it('is anonymous with no Authorization header', async () => {
    expect(await authenticate({})).toEqual({ user: null })
  })

  it('is anonymous for a non-Bearer scheme (no credential smuggling)', async () => {
    expect(await authenticate({ authorization: 'Basic dXNlcjpwYXNz' })).toEqual({ user: null })
  })

  it('is anonymous for an empty Bearer token', async () => {
    expect(await authenticate({ authorization: 'Bearer ' })).toEqual({ user: null })
  })

  it('is anonymous for a malformed Bearer token (never provisions on unverified input)', async () => {
    expect(await authenticate({ authorization: 'Bearer not-a-real-jwt' })).toEqual({ user: null })
  })

  it('is anonymous for a structurally-shaped but unverifiable JWS', async () => {
    expect(await authenticate({ authorization: 'Bearer aaa.bbb.ccc' })).toEqual({ user: null })
  })
})

describe('auth-iam surface — one identity path, no header trust', () => {
  it('exports the cryptographic Bearer strategy', () => {
    expect(typeof authIam.hanzoIAMStrategy).toBe('function')
  })

  it('does NOT export a header-trust proxy strategy (cross-tenant override removed)', () => {
    expect('hanzoProxyStrategy' in authIam).toBe(false)
  })
})
