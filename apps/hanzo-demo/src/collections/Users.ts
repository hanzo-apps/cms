import type { CollectionConfig } from '@hanzo/cms'

import { hanzoIAMStrategy, hanzoProxyStrategy, iamAuthFields } from '@hanzo/cms-auth-iam'

/**
 * Users authenticate ONLY through Hanzo IAM SSO — IAM is the sole identity
 * authority; the local email/password strategy is disabled. Two SSO paths:
 *   - hanzoIAMStrategy:   Bearer IAM token (API / M2M / scripts), verified via
 *                         JWKS. org (owner) == tenant.
 *   - hanzoProxyStrategy: same-origin console embed — the console proxy has
 *                         already verified the browser's IAM session and injects
 *                         session-derived tenant headers + a shared secret.
 *                         Enables the browser admin UI behind console with no
 *                         second login. Fail-secure (disabled unless
 *                         HANZO_PROXY_SECRET is set). org == tenant.
 * Users are provisioned on first login from the verified identity.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [hanzoIAMStrategy(), hanzoProxyStrategy()],
  },
  fields: [
    // email is added by the auth config
    ...iamAuthFields,
  ],
}
