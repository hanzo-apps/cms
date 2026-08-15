import type { AuthStrategy, AuthStrategyFunctionArgs, AuthStrategyResult, CMS } from '@hanzo/cms'

import { parseCookies } from '@hanzo/cms/shared'
import { createRemoteJWKSet, jwtVerify } from 'jose'

import type { HanzoIAMStrategyConfig, IAMClaims } from './types.js'

import { TENANT_COOKIE, tenantCookie } from './org.js'

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

/**
 * The IAM access token, from the Authorization header or from the session
 * cookie. The cookie is `${cookiePrefix}-token` — the framework's own session
 * name — so an IAM token written there IS the session, and the whole admin
 * (RootPage, /me, /refresh) reads it with no second mechanism.
 *
 * The cookie arm repeats extractJWT's Origin / Sec-Fetch-Site rule rather than
 * calling it: extractJWT is internal to the framework, and this strategy owns
 * its own transport. Same rule, same order — an Origin is checked against the
 * csrf allowlist; with no Origin, Sec-Fetch-Site decides; a cross-site request
 * or a non-browser client presenting neither is refused, so the cookie cannot
 * be ridden from another origin.
 */
export const iamToken = (headers: AuthStrategyFunctionArgs['headers'], cms: CMS): null | string => {
  const raw = headers.get('authorization')
  if (raw) {
    const [scheme, token] = raw.split(' ')
    if (scheme && token && scheme.toLowerCase() === 'bearer') {
      return token.trim()
    }
  }

  const cookieToken = parseCookies(headers).get(`${cms.config.cookiePrefix}-token`)
  if (!cookieToken) {
    return null
  }

  const csrf = cms.config.csrf
  const origin = headers.get('Origin')
  if (origin) {
    return csrf.length === 0 || csrf.includes(origin) ? cookieToken : null
  }
  if (csrf.length === 0) {
    return cookieToken
  }
  const site = headers.get('Sec-Fetch-Site')
  return site === 'same-origin' || site === 'same-site' || site === 'none' ? cookieToken : null
}

/**
 * The org slugs this token grants, home first. `orgs` is the signed tenancy set
 * — home org, then every explicit membership — so it is the whole answer when
 * present. `owner` alone is the fallback for a token that carries no membership.
 */
const orgsOf = (claims: IAMClaims): string[] => {
  const home = claims.owner
  const slugs = (claims.orgs ?? []).map((entry) => entry?.org).filter((org): org is string => !!org)
  const ordered = home ? [home, ...slugs.filter((org) => org !== home)] : slugs
  return [...new Set(ordered)]
}

/**
 * Administers the org named by `owner`. IAM derives the home entry's role from
 * the user's own admin bit, so the home role IS that bit — read back here rather
 * than from a token field, because there is no such field to read.
 */
const administersHome = (claims: IAMClaims): boolean => {
  const home = claims.orgs?.find((entry) => entry?.org === claims.owner)
  return home?.role === 'admin' || home?.role === 'owner'
}

/**
 * Provision-or-refresh the tenant doc for an IAM org (org == tenant), returning
 * its id. Idempotent: keyed on the org slug.
 */
const ensureTenant = async (args: {
  cms: CMS
  slug: string
  tenantsSlug: string
}): Promise<number | string | undefined> => {
  const { slug, cms, tenantsSlug } = args

  // Only touch the collection if it actually exists in this config.
  if (!cms.collections?.[tenantsSlug]) {
    return undefined
  }

  const existing = await cms.find({
    collection: tenantsSlug,
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  const existingDoc = existing.docs[0]
  if (existingDoc) {
    return existingDoc.id
  }

  const created = await cms.create({
    collection: tenantsSlug,
    data: { name: slug, slug },
  })
  return created.id
}

/**
 * The Hanzo IAM SSO auth strategy.
 *
 * Validates a Hanzo IAM access token (RS256) against the published JWKS — no
 * shared secret, no per-request round-trip to IAM. The token arrives as a Bearer
 * header from an API client or in the session cookie from the admin, and either
 * way IAM signed it. Verified claims map to a CMS user (find-or-provision by IAM
 * `sub`), whose tenant set is the token's `orgs` membership (org == tenant), and
 * the `cms-tenant` cookie opens on the home org so the multi-tenant plugin scopes
 * every subsequent query.
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
  // Which IAM clients this deployment answers to. Every client in the issuer
  // shares one signing key, so issuer and signature alone admit a token minted
  // for any other app; naming the clients is what confines it to this one.
  // A token is accepted when its `aud` carries any listed client.
  const audience = config.audience?.length
    ? config.audience
    : (process.env.HANZO_IAM_AUDIENCE?.split(',')
        .map((entry) => entry.trim())
        .filter(Boolean) ?? [])

  return {
    name,
    authenticate: async ({
      canSetHeaders,
      cms,
      headers,
    }: AuthStrategyFunctionArgs): Promise<AuthStrategyResult> => {
      const token = iamToken(headers, cms)
      if (!token) {
        return { user: null }
      }

      let claims: IAMClaims
      try {
        const { payload: verified } = await jwtVerify(token, getJWKS(jwksUri), {
          // Name the algorithm. Left open, the verifier accepts whatever the
          // header asks for among the key's permitted set, which makes the
          // token's own header a party to deciding how it is checked. IAM signs
          // RS256; nothing else is expected and nothing else is accepted.
          algorithms: ['RS256'],
          ...(audience.length ? { audience } : {}),
          // IAM sets nbf equal to iat, and jose allows no skew by default, so a
          // server running seconds ahead of the issuer rejects a token that was
          // just minted — a sign-in that fails with no reason a user can see and
          // no reason a log makes obvious. Thirty seconds is far inside the
          // token's own lifetime.
          clockTolerance: 30,
          issuer,
        })
        claims = verified as IAMClaims
      } catch {
        // invalid / expired / wrong-issuer token → anonymous
        return { user: null }
      }

      if (!claims.sub) {
        return { user: null }
      }

      // Every org the token grants becomes a tenant, home first. The membership
      // is the token's, so it is re-derived on every sign-in and a tenant a user
      // has lost is dropped from the row the next time they arrive.
      const slugs = orgsOf(claims)
      const tenantIDs: (number | string)[] = []
      for (const slug of slugs) {
        const id = await ensureTenant({ slug, cms, tenantsSlug })
        if (id !== undefined) {
          tenantIDs.push(id)
        }
      }
      const homeTenantID = tenantIDs[0]

      // find-or-provision the user by IAM subject
      const found = await cms.find({
        collection: authSlug,
        depth: 0,
        limit: 1,
        where: { iamSub: { equals: claims.sub } },
      })

      // IAM is the authority on identity, so the row takes the claims of the
      // token presented and holds them until the next sign-in. Clients differ
      // in what they emit, so the row reflects the app a caller last arrived
      // from. Naming `audience` is what settles that: it confines the row to
      // clients this deployment answers to.
      const baseData = {
        email: claims.email || `${claims.sub}@iam.local`,
        groups: Array.isArray(claims.groups) ? claims.groups : [],
        iamOrg: claims.owner,
        iamSub: claims.sub,
        isAdmin: administersHome(claims),
        username: claims.name,
        ...(config.claimsToUser ? config.claimsToUser(claims) : {}),
        ...(tenantIDs.length
          ? { [tenantsArrayField]: tenantIDs.map((tenant) => ({ tenant })) }
          : {}),
      }

      let userDoc
      const foundUser = found.docs[0]
      if (foundUser) {
        userDoc = await cms.update({
          id: foundUser.id,
          collection: authSlug,
          data: baseData,
        })
      } else {
        // No password: the local strategy is off, so the row has no credential
        // to present and none to guess.
        userDoc = await cms.create({ collection: authSlug, data: baseData })
      }

      // Open the session on the home tenant, and only then: the switcher writes
      // this same cookie, so re-asserting home on every request would undo a
      // selection the moment it was made. A selection outside the token's set is
      // not this strategy's problem to police — activeOrg discards it, and the
      // plugin intersects it with the tenant constraint, so a stale one narrows.
      const responseHeaders = new Headers()
      const selected = parseCookies(headers).get(TENANT_COOKIE)
      if (canSetHeaders && homeTenantID !== undefined && !selected) {
        responseHeaders.append('Set-Cookie', tenantCookie(homeTenantID))
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
