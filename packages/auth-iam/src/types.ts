/**
 * Claims we rely on from a Hanzo IAM (Casdoor) access token.
 * `owner` is the org slug — in Hanzo, org == tenant. There is no separate CMS
 * tenant concept; the IAM org IS the tenancy boundary.
 */
export type IAMClaims = {
  aud?: string | string[]
  email?: string
  exp?: number
  iss?: string
  /** username */
  name?: string
  /** org slug — the tenant */
  owner?: string
  /** user id (uuid) */
  sub?: string
}

export type HanzoIAMStrategyConfig = {
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
