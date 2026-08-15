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
    // The session this cookie carries reaches every tenant when it belongs to
    // the reserved org, so it travels over TLS only.
    cookies: { secure: true },
    // Local (email/password) strategy stays ENABLED so the admin login view
    // renders its form; the IAM bearer strategy is layered on top for SSO/API.
    strategies: [hanzoIAMStrategy()],
  },
  // sanitizeConfig appends the framework's auth endpoints AFTER a collection's
  // own, and the router takes the first match, so this replaces `/first-register`
  // rather than adding to it. That route creates a user from the request body
  // with `overrideAccess: true` — skipping field access, so the body may carry
  // `iamOrg` — and returns a session, guarded only by the table being empty.
  // Identity comes from IAM and the superuser comes from the seed, so nothing
  // needs it. Refused for everyone: an authenticated caller has no more claim
  // to mint the first user than an anonymous one.
  endpoints: [
    {
      handler: () => Response.json({ errors: [{ message: 'Forbidden' }] }, { status: 403 }),
      method: 'post',
      path: '/first-register',
    },
  ],
  fields: [
    // `email` is supplied by the local auth strategy; iamAuthFields carries the
    // IAM claim-mapping fields only.
    ...iamAuthFields,
  ],
}
