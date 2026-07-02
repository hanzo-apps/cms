import type {
  AuthStrategy,
  AuthStrategyFunctionArgs,
  AuthStrategyResult,
  Payload,
} from '@hanzo/cms'

import { createRemoteJWKSet, jwtVerify } from 'jose'

import type { HanzoIAMStrategyConfig, IAMClaims } from './types.js'

const DEFAULT_ISSUER = 'https://hanzo.id'
const DEFAULT_JWKS = 'https://hanzo.id/v1/iam/.well-known/jwks'

/** Lazily-built, per-JWKS-URL cached remote key set (jose caches internally). */
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

const getJWKS = (uri: string) => {
  let set = jwksCache.get(uri)
  if (!set) {
    set = createRemoteJWKSet(new URL(uri))
    jwksCache.set(uri, set)
  }
  return set
}

const getBearer = (headers: AuthStrategyFunctionArgs['headers']): null | string => {
  const raw = headers.get('authorization') || headers.get('Authorization')
  if (!raw) {
    return null
  }
  const [scheme, token] = raw.split(' ')
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null
  }
  return token.trim()
}

/**
 * Provision-or-refresh the tenant doc for an IAM org (org == tenant), returning
 * its id. Idempotent: keyed on the org slug.
 */
const ensureTenant = async (args: {
  claims: IAMClaims
  payload: Payload
  tenantsSlug: string
}): Promise<number | string | undefined> => {
  const { claims, payload, tenantsSlug } = args
  const slug = claims.owner
  if (!slug) {
    return undefined
  }

  // Only touch the collection if it actually exists in this config.
  if (!payload.collections?.[tenantsSlug]) {
    return undefined
  }

  const existing = await payload.find({
    collection: tenantsSlug,
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  const existingDoc = existing.docs[0]
  if (existingDoc) {
    return existingDoc.id
  }

  const created = await payload.create({
    collection: tenantsSlug,
    data: { name: slug, slug },
  })
  return created.id
}

/**
 * The Hanzo IAM SSO auth strategy.
 *
 * Validates a Bearer access token issued by Hanzo IAM (Casdoor, RS256) against
 * the published JWKS — no shared secret, no per-request round-trip to IAM. Maps
 * the verified claims to a Payload user (find-or-provision by IAM `sub`), links
 * the user to the tenant derived from the IAM `owner` org (org == tenant), and
 * sets the `payload-tenant` cookie so the multi-tenant plugin scopes every
 * subsequent query to that org.
 *
 * IAM is the sole identity authority: there is no separate CMS login.
 */
export const hanzoIAMStrategy = (config: HanzoIAMStrategyConfig = {}): AuthStrategy => {
  const name = config.name || 'hanzo-iam'
  const authSlug = config.authSlug || 'users'
  const tenantsSlug = config.tenantsSlug || 'tenants'
  const tenantsArrayField = config.tenantsArrayField || 'tenants'
  const issuer = config.issuer || process.env.HANZO_IAM_ISSUER || DEFAULT_ISSUER
  const jwksUri = config.jwksUri || process.env.HANZO_IAM_JWKS_URI || DEFAULT_JWKS
  // Optional audience pinning (least privilege). Empty → aud not checked.
  const audience =
    config.audience ??
    (process.env.HANZO_IAM_AUDIENCE
      ? process.env.HANZO_IAM_AUDIENCE.split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      : undefined)

  return {
    name,
    authenticate: async ({
      canSetHeaders,
      headers,
      payload,
    }: AuthStrategyFunctionArgs): Promise<AuthStrategyResult> => {
      const token = getBearer(headers)
      if (!token) {
        return { user: null }
      }

      let claims: IAMClaims
      try {
        const { payload: verified } = await jwtVerify(token, getJWKS(jwksUri), {
          ...(audience ? { audience } : {}),
          issuer,
        })
        claims = verified as IAMClaims
      } catch {
        // invalid / expired / wrong-issuer / wrong-audience token → anonymous
        return { user: null }
      }

      if (!claims.sub) {
        return { user: null }
      }

      const tenantID = await ensureTenant({ claims, payload, tenantsSlug })

      // find-or-provision the user by IAM subject
      const found = await payload.find({
        collection: authSlug,
        depth: 0,
        limit: 1,
        where: { iamSub: { equals: claims.sub } },
      })

      const baseData = {
        email: claims.email || `${claims.sub}@iam.local`,
        iamOrg: claims.owner,
        iamSub: claims.sub,
        username: claims.name,
        ...(config.claimsToUser ? config.claimsToUser(claims) : {}),
        ...(tenantID !== undefined ? { [tenantsArrayField]: [{ tenant: tenantID }] } : {}),
      }

      let userDoc
      const foundUser = found.docs[0]
      if (foundUser) {
        userDoc = await payload.update({
          id: foundUser.id,
          collection: authSlug,
          data: baseData,
        })
      } else {
        userDoc = await payload.create({
          collection: authSlug,
          data: baseData,
        })
      }

      const responseHeaders = new Headers()
      if (canSetHeaders && tenantID !== undefined) {
        responseHeaders.append(
          'Set-Cookie',
          `payload-tenant=${encodeURIComponent(String(tenantID))}; Path=/; SameSite=Lax; HttpOnly`,
        )
      }

      return {
        responseHeaders: canSetHeaders ? responseHeaders : undefined,
        user: {
          ...userDoc,
          _strategy: name,
          collection: authSlug,
        },
      }
    },
  }
}
