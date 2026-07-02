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
   * Expected token audience(s). When set, the token's `aud` MUST include one of
   * these (jose rejects otherwise) — completes RFC-8725 claim checking
   * (iss + aud + exp) and scopes the CMS to tokens minted FOR it, so a token
   * issued for an unrelated app cannot be replayed here. Defaults to
   * HANZO_IAM_AUDIENCE (comma-separated). When unset, `aud` is not checked
   * (issuer + signature + expiry still are); set it once a `hanzo-cms` IAM app
   * mints CMS-scoped tokens to tighten least privilege.
   */
  audience?: string | string[]
  /**
   * Slug of the Payload auth collection users are mapped into (e.g. 'users').
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
   * Strategy name surfaced to Payload. Defaults to 'hanzo-iam'.
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
