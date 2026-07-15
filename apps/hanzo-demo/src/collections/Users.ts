import type { CollectionConfig } from '@hanzo/cms'

import { hanzoIAMStrategy, iamAuthFields } from '@hanzo/cms-auth-iam'

/**
 * Users authenticate through Hanzo IAM SSO (bearer/JWKS) AND, for the admin
 * panel, the local email/password strategy — both coexist. IAM is the identity
 * authority for every API/SSO user (provisioned on first login from verified
 * claims; org (owner) == tenant); the local strategy exists solely so the
 * seeded `z@<domain>` superuser can sign in at /admin/login without an external
 * OIDC round-trip. Passwords are hashed by the framework — never stored plain.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // Local (email/password) strategy stays ENABLED so the admin login view
    // renders its form; the IAM bearer strategy is layered on top for SSO/API.
    strategies: [hanzoIAMStrategy()],
  },
  fields: [
    // `email` is supplied by the local auth strategy; iamAuthFields carries the
    // IAM claim-mapping fields only.
    ...iamAuthFields,
  ],
}
