import type { CollectionConfig } from '@hanzo/cms'

import { isSuperAdmin } from '@hanzo/cms-auth-iam'

/**
 * Tenants == IAM orgs. One row per org, keyed on the IAM `owner` slug.
 * Provisioned by @hanzo/cms-auth-iam on first login. There is never a tenant
 * concept separate from the IAM org.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  // The row IS the tenant boundary, and `slug` is the key every other
  // collection is scoped by, so writing one reaches every org: a caller that
  // creates a tenant claims a slug an org has yet to sign in under. The
  // strategy provisions rows through the local API, which overrides access.
  // Reads stay open so a signed-in user can resolve the tenant they belong to.
  access: {
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: { description: 'IAM org slug (the tenant key).' },
      index: true,
      required: true,
      unique: true,
    },
  ],
}
