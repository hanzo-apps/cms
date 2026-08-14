import type { AccessArgs, CollectionConfig } from '@hanzo/cms'

import { describe, expect, it } from 'vitest'

import type { UserWithTenantsField } from '../types.js'

import { collectionAccessKeys } from './addCollectionAccess.js'
import { withTenantAccess } from './withTenantAccess.js'

/**
 * Read scoping across two tenants.
 *
 * `withTenantAccess` returns a `Where` that every query is filtered by. For a
 * caller who is not a super it names that caller's own tenants, so another
 * tenant's rows are unreachable; for a super it returns the underlying result
 * unconstrained. The predicate is the entire boundary — these cases pin what it
 * is handed and what each answer produces.
 */

const ACME = 'tenant-acme'
const MAXPOWER = 'tenant-maxpower'

const pages = { slug: 'pages', access: {} } as unknown as CollectionConfig

/** The shipped predicate: membership in the reserved `admin` org. */
const reservedOrgOnly = (user: unknown) => (user as { iamOrg?: unknown } | null)?.iamOrg === 'admin'

const acmeOrgAdmin = {
  id: 'user-acme-admin',
  collection: 'users',
  iamOrg: 'acme',
  isAdmin: true,
  tenants: [{ tenant: ACME }],
} as unknown as UserWithTenantsField

const superAdmin = {
  id: 'user-super',
  collection: 'users',
  iamOrg: 'admin',
  isAdmin: false,
  tenants: [{ tenant: ACME }],
} as unknown as UserWithTenantsField

const readAccess = (userHasAccessToAllTenants: (user: unknown) => boolean) =>
  withTenantAccess({
    accessKey: 'read',
    adminUsersSlug: 'users',
    collection: pages,
    fieldName: 'tenant',
    tenantsArrayFieldName: 'tenants',
    tenantsArrayTenantFieldName: 'tenant',
    userHasAccessToAllTenants,
  })

const resultFor = (
  user: UserWithTenantsField,
  userHasAccessToAllTenants: (user: unknown) => boolean = reservedOrgOnly,
) => readAccess(userHasAccessToAllTenants)({ req: { user } } as unknown as AccessArgs)

describe('withTenantAccess across two tenants', () => {
  it("scopes an org admin to their own tenant, leaving another tenant's rows unreachable", async () => {
    const where = (await resultFor(acmeOrgAdmin)) as { tenant?: { in?: string[] } }

    expect(where.tenant?.in).toEqual([ACME])
    expect(where.tenant?.in).not.toContain(MAXPOWER)
  })

  it('scopes an org admin on every access key, not only read', async () => {
    for (const accessKey of collectionAccessKeys) {
      const fieldName = accessKey === 'readVersions' ? 'version.tenant' : 'tenant'
      const where = (await withTenantAccess({
        accessKey,
        adminUsersSlug: 'users',
        collection: pages,
        fieldName,
        tenantsArrayFieldName: 'tenants',
        tenantsArrayTenantFieldName: 'tenant',
        userHasAccessToAllTenants: reservedOrgOnly,
      })({ req: { user: acmeOrgAdmin } } as unknown as AccessArgs)) as Record<
        string,
        { in?: string[] }
      >

      expect(where[fieldName]?.in, `${accessKey} must be tenant-scoped`).toEqual([ACME])
    }
  })

  it('leaves a super unconstrained', async () => {
    expect(await resultFor(superAdmin)).toBe(true)
  })

  it('denies a caller holding no tenant', async () => {
    const orphan = { id: 'user-orphan', collection: 'users' } as unknown as UserWithTenantsField

    expect(await resultFor(orphan)).toBe(false)
  })

  it('hands the whole estate to an org admin once the predicate reads isAdmin', async () => {
    // Negative control: the machinery transmits the predicate faithfully, so a
    // predicate that accepts the org-scoped claim removes the tenant filter for
    // every customer's own administrator.
    const widened = (user: unknown) =>
      reservedOrgOnly(user) || Boolean((user as { isAdmin?: boolean } | null)?.isAdmin)

    expect(await resultFor(acmeOrgAdmin, widened)).toBe(true)
  })
})
