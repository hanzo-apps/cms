import type { CollectionConfig } from '@hanzo/cms'

import { hanzoIAMStrategy, iamAuthFields } from '@hanzo/cms-auth-iam'

/**
 * Users authenticate ONLY through Hanzo IAM SSO. The local email/password
 * strategy is disabled — IAM is the sole identity authority. Users are
 * provisioned on first login from verified IAM claims; org (owner) == tenant.
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
