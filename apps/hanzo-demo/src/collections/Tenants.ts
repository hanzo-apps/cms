import type { CollectionConfig } from '@hanzo/cms'

/**
 * Tenants == IAM orgs. One row per org, keyed on the IAM `owner` slug.
 * Provisioned by @hanzo/cms-auth-iam on first login. There is never a tenant
 * concept separate from the IAM org.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
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
