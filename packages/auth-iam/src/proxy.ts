import type { AuthStrategy, AuthStrategyFunctionArgs, AuthStrategyResult, Payload } from '@hanzo/cms'

import type { HanzoProxyStrategyConfig } from './types.js'

/**
 * The Hanzo same-origin SSO proxy auth strategy.
 *
 * Console (and any brand cloud) embeds the CMS admin behind a same-origin
 * reverse proxy that has ALREADY verified the browser's IAM session server-side.
 * The proxy injects session-derived tenant headers (`x-org-id` == the IAM org,
 * `x-actor-id` == the user) and a shared proxy secret. The browser itself never
 * holds a CMS credential, so the Bearer-token IAM strategy cannot authenticate
 * the admin UI; this strategy closes that gap.
 *
 * Trust model (defense in depth):
 *   1. Shared secret — the request must carry `x-hanzo-proxy-secret` matching
 *      `HANZO_PROXY_SECRET` (sourced from KMS). Absent/mismatch → anonymous.
 *      Fail-secure: if no secret is configured on the server, the strategy is
 *      DISABLED (returns null) so a header alone can never authenticate.
 *   2. Network policy — only the console proxy pods may reach the CMS service.
 *   3. Tenant headers are set by the proxy from the verified session, never
 *      forwarded from the untrusted client.
 *
 * org == tenant: `x-org-id` is provisioned as / mapped to the tenant, the user
 * is find-or-provisioned by `x-actor-id`, and the `payload-tenant` cookie is set
 * so the multi-tenant plugin scopes every subsequent query to that org.
 */
export const hanzoProxyStrategy = (config: HanzoProxyStrategyConfig = {}): AuthStrategy => {
  const name = config.name || 'hanzo-proxy'
  const authSlug = config.authSlug || 'users'
  const tenantsSlug = config.tenantsSlug || 'tenants'
  const tenantsArrayField = config.tenantsArrayField || 'tenants'
  const orgHeader = config.orgHeader || 'x-org-id'
  const actorHeader = config.actorHeader || 'x-actor-id'
  const secretHeader = config.secretHeader || 'x-hanzo-proxy-secret'
  const secret = config.secret || process.env.HANZO_PROXY_SECRET

  return {
    name,
    authenticate: async ({
      canSetHeaders,
      headers,
      payload,
    }: AuthStrategyFunctionArgs): Promise<AuthStrategyResult> => {
      // Fail-secure: no server secret configured → strategy is a no-op. A
      // client header can NEVER authenticate on its own.
      if (!secret) {
        return { user: null }
      }

      const presented = headers.get(secretHeader)
      if (!presented || presented !== secret) {
        return { user: null }
      }

      const org = headers.get(orgHeader)?.trim()
      const actor = headers.get(actorHeader)?.trim()
      if (!org || !actor) {
        return { user: null }
      }

      const tenantID = await ensureTenant({ org, payload, tenantsSlug })

      const found = await payload.find({
        collection: authSlug,
        depth: 0,
        limit: 1,
        where: { iamSub: { equals: actor } },
      })

      const baseData = {
        email: headers.get('x-actor-email')?.trim() || `${actor}@iam.local`,
        iamOrg: org,
        iamSub: actor,
        ...(tenantID !== undefined ? { [tenantsArrayField]: [{ tenant: tenantID }] } : {}),
      }

      const foundUser = found.docs[0]
      const userDoc = foundUser
        ? await payload.update({ collection: authSlug, data: baseData, id: foundUser.id })
        : await payload.create({ collection: authSlug, data: baseData })

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

/** Provision-or-lookup the tenant for an org slug (org == tenant). Idempotent. */
const ensureTenant = async (args: {
  org: string
  payload: Payload
  tenantsSlug: string
}): Promise<number | string | undefined> => {
  const { org, payload, tenantsSlug } = args
  if (!payload.collections?.[tenantsSlug]) {
    return undefined
  }
  const existing = await payload.find({
    collection: tenantsSlug,
    depth: 0,
    limit: 1,
    where: { slug: { equals: org } },
  })
  const existingDoc = existing.docs[0]
  if (existingDoc) {
    return existingDoc.id as number | string
  }
  const created = await payload.create({
    collection: tenantsSlug,
    data: { name: org, slug: org },
  })
  return created.id as number | string
}
