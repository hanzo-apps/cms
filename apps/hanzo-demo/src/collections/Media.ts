import type { CollectionConfig } from '@hanzo/cms'

/**
 * Media/DAM collection. Uploads are routed by @hanzo/cms-storage-s3 to
 * SeaweedFS (hanzoai/s3), per-org prefix. Proves a real S3 object lands.
 *
 * SECURITY (org == tenant isolation): do NOT define a custom `access.read`.
 * A naked `read: () => true` returns a boolean that bypasses the multi-tenant
 * plugin's tenant scoping for unauthenticated requests — in withTenantAccess the
 * tenant-constraint block is guarded by `req.user`, so an anonymous caller falls
 * through to `return true`, exposing every org's media in the shared per-org
 * SQLite db (cross-tenant disclosure). By omitting `access`, the plugin default
 * applies: `({ req }) => Boolean(req.user)` composed with a tenant `Where`
 * constraint — authenticated AND scoped to the caller's tenant, same posture as
 * Pages. If public media is ever required, scope it by tenant/hostname and
 * published-status — never an unconditional `true`.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  // A tenant-enabled collection must declare `fields`, even when every field it
  // has is contributed by a plugin: the multi-tenant plugin reads and unshifts
  // into this array during buildConfig, which is before Payload would default it
  // to []. Deleting it crashes the app at its first request.
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
  hooks: {
    // One key space per tenant. The static per-deployment prefix put every
    // tenant's objects in a single namespace, so two tenants uploading the same
    // filename resolved to one key and the second silently overwrote the first
    // — a cross-tenant write through the storage layer rather than the database.
    // The prefix is derived only from the server-set `tenant`, never from the
    // request body. beforeValidate runs ahead of the storage adapter's upload,
    // which reads `data.prefix`.
    beforeValidate: [
      ({ data }) => {
        if (data && data.tenant !== undefined && data.tenant !== null) {
          const tenant = data.tenant as { id?: number | string } | number | string
          const tenantID = typeof tenant === 'object' ? tenant.id : tenant

          if (tenantID !== undefined && tenantID !== null) {
            data.prefix = `org-${String(tenantID)}`
          }
        }

        return data
      },
    ],
  },
  upload: true,
}
