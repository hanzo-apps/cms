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

/**
 * Config for the same-origin SSO proxy strategy (browser admin embed). The
 * proxy has already verified the IAM session; this strategy trusts its
 * session-derived tenant headers only when the shared secret matches.
 */
export type HanzoProxyStrategyConfig = {
  /** Header carrying the actor (user) id. Defaults to 'x-actor-id'. */
  actorHeader?: string
  /** Payload auth collection slug. Defaults to 'users'. */
  authSlug?: string
  /** Strategy name surfaced to Payload. Defaults to 'hanzo-proxy'. */
  name?: string
  /** Header carrying the IAM org (== tenant) slug. Defaults to 'x-org-id'. */
  orgHeader?: string
  /**
   * Shared secret the proxy must present. Defaults to env HANZO_PROXY_SECRET.
   * When unset the strategy is DISABLED (fail-secure) — a header alone can
   * never authenticate.
   */
  secret?: string
  /** Header carrying the shared secret. Defaults to 'x-hanzo-proxy-secret'. */
  secretHeader?: string
  /** User→tenant array field managed by the multi-tenant plugin. Defaults 'tenants'. */
  tenantsArrayField?: string
  /** Tenants collection slug (org == tenant). Defaults to 'tenants'. */
  tenantsSlug?: string
}
