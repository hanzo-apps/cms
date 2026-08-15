/**
 * Claims we rely on from a Hanzo IAM (Casdoor) access token.
 * `owner` is the org slug — in Hanzo, org == tenant. There is no separate CMS
 * tenant concept; the IAM org IS the tenancy boundary.
 *
 * Names are the ones IAM signs (hanzoai/iam internal/oidc/jwt.go Claims).
 * `isAdmin` and `picture` are NOT here: IAM serves both from userinfo and never
 * puts them in a token, so a field for either would read as always-false /
 * always-absent. Org administration arrives instead as the `orgs` entry role.
 */
export type IAMClaims = {
  aud?: string | string[]
  /** display name */
  displayName?: string
  email?: string
  exp?: number
  /** group slugs the user belongs to */
  groups?: string[]
  iss?: string
  /** username */
  name?: string
  /**
   * Tenancy set: home org first, then every explicit membership, deduped.
   * Present on every user token; omitted on a machine (client_credentials) one,
   * which has no membership and so reaches no tenant here.
   */
  orgs?: { org: string; role?: 'admin' | 'member' | 'owner' }[]
  /** org slug — the home tenant */
  owner?: string
  /** user id (uuid) */
  sub?: string
}

export type HanzoIAMStrategyConfig = {
  /**
   * IAM client ids this deployment answers to. A token is accepted when its
   * `aud` carries any of them. Defaults to HANZO_IAM_AUDIENCE (comma
   * separated). Empty accepts any client of the issuer, which is every app on
   * the platform, so name the clients wherever the deployment is known.
   */
  audience?: string[]
  /**
   * Slug of the CMS auth collection users are mapped into (e.g. 'users').
   */
  authSlug?: string
  /**
   * Extra fields to set/refresh on the mapped user each login. Receives the
   * verified claims; returns a partial user document.
   */
  claimsToUser?: (claims: IAMClaims) => Record<string, unknown>
  /**
   * Expected token issuer. Defaults to HANZO_IAM_ISSUER or https://hanzo.id.
   */
  issuer?: string
  /**
   * JWKS URL. Defaults to HANZO_IAM_JWKS_URI or
   * https://hanzo.id/v1/iam/.well-known/jwks.
   */
  jwksUri?: string
  /**
   * Strategy name surfaced to CMS. Defaults to 'hanzo-iam'.
   */
  name?: string
  /**
   * Name of the tenant field on the user (link user -> tenant). When the
   * multi-tenant plugin is wired, this is the array field it manages.
   * Defaults to 'tenants'.
   */
  tenantsArrayField?: string
  /**
   * Slug of the tenants collection (org == tenant). Defaults to 'tenants'.
   * A tenant doc is provisioned per IAM org on first login.
   */
  tenantsSlug?: string
}
