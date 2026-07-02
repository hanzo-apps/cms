import type { CollectionConfig } from '@hanzo/cms'

import { hanzoIAMStrategy, iamAuthFields } from '@hanzo/cms-auth-iam'

/**
 * Users authenticate ONLY through Hanzo IAM SSO — IAM is the sole identity
 * authority; the local email/password strategy is disabled (no native signup).
 *
 * ONE identity path: `hanzoIAMStrategy` — a Bearer IAM token verified against the
 * published JWKS (signature + issuer + expiry, optionally audience). The tenant
 * (org) is taken ONLY from the cryptographically-verified `owner` claim — never
 * from a request header or any other client-supplied value — and the multi-tenant
 * plugin scopes every read/write to it (org == tenant).
 *
 * There is deliberately NO header-trust / shared-secret proxy strategy: a strategy
 * that derived the org from an `x-org-id` header (gated only by a shared secret)
 * let any secret-holder impersonate ANY org over the public ingress — a
 * cross-tenant disclosure. Identity is proven by a signed token, full stop. A
 * browser admin behind console must present a validated IAM token (Bearer), not a
 * forgeable header. Users are provisioned on first login from the verified claims.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [hanzoIAMStrategy()],
  },
  fields: [
    // email is added by the auth config
    ...iamAuthFields,
  ],
}
