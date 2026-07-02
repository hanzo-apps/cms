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
  hooks: {
    // Per-tenant S3 key prefix (defense in depth). Without this every org shared
    // one static prefix (the HANZO_ORG env), so two orgs uploading the same
    // filename collide/overwrite in one key space. Derive the prefix ONLY from
    // the server-set `tenant` (which the multi-tenant plugin + the tenant-field
    // ownership guard bind to the caller's validated IAM org) — never a client
    // value. beforeValidate runs before the storage adapter's beforeChange
    // upload, which reads `data.prefix`. Bytes stay access-controlled + the
    // bucket private; this just isolates the key space.
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
