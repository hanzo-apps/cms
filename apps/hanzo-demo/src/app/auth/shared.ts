/**
 * What the three auth routes agree on: where this deployment is, which IAM
 * clients it registers as, and the one cookie the round-trip carries.
 *
 * Every value is read from the environment on the server. Nothing here is
 * NEXT_PUBLIC_*, so nothing is baked into the client bundle at build time and
 * one image serves any environment.
 */

/** The transient PKCE/state cookie, scoped to /auth and gone in ten minutes. */
export const OAUTH_COOKIE = 'cms-oauth'

/**
 * This deployment's own origin. The redirect URI is derived from it, so it must
 * match what IAM has registered — the upsert REPLACES redirect URIs, and a URI
 * the provision document cannot say is one the next converge deletes.
 */
export const serverURL = (): string =>
  (process.env.SERVER_URL || 'https://cms.hanzo.ai').replace(/\/$/, '')

/** `/auth/callback` is the estate's one browser callback path. */
export const redirectURI = (): string => `${serverURL()}/auth/callback`

/** The tenant client: signs in members of the org this deployment serves. */
export const clientID = (): string => process.env.HANZO_IAM_CLIENT_ID || 'hanzo-cms'

/**
 * The reserved-org client. A SuperAdmin can only be minted through an app whose
 * own organization is `admin`, so platform operators arrive through this one and
 * everyone else through the tenant client.
 */
export const adminClientID = (): string => process.env.HANZO_IAM_ADMIN_CLIENT_ID || 'admin-cms'
