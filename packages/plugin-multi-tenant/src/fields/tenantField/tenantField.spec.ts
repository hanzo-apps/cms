import { describe, expect, it } from 'vitest'

import type { UserWithTenantsField } from '../../types.js'

import { tenantField } from './index.js'

/**
 * Tenant ownership on write.
 *
 * The guard lives on the field's beforeChange hook rather than its `validate`,
 * because Payload skips `validate` whenever `skipValidation` is set — which it
 * does for every draft save on a drafts-enabled collection. The last test in
 * this file is the one that pins that down: it drives the same write through the
 * path a draft takes, where a `validate`-based check is simply never called.
 */

const ALLOWED_TENANT = 'tenant-a'
const FOREIGN_TENANT = 'tenant-b'

const makeField = (
  userHasAccessToAllTenants: (user: UserWithTenantsField) => boolean = () => false,
) =>
  tenantField({
    name: 'tenant',
    tenantsArrayFieldName: 'tenants',
    tenantsArrayTenantFieldName: 'tenant',
    tenantsCollectionSlug: 'tenants',
    unique: false,
    userHasAccessToAllTenants,
  })

const guardOf = (userHasAccessToAllTenants?: (user: UserWithTenantsField) => boolean) => {
  const field = makeField(userHasAccessToAllTenants)
  const hook = field.hooks?.beforeChange?.[0]

  if (!hook) {
    throw new Error('tenantField must install a beforeChange ownership guard')
  }

  return hook
}

const memberOfTenantA = {
  id: 'user-1',
  collection: 'users',
  tenants: [{ tenant: ALLOWED_TENANT }],
} as unknown as UserWithTenantsField

const run = (hook: NonNullable<ReturnType<typeof guardOf>>, user: unknown, value: unknown) =>
  (hook as (args: unknown) => unknown)({
    req: { t: undefined, user },
    value,
  })

/**
 * Assert a genuine 403 rather than merely "something threw" — otherwise these
 * cases would also pass if the guard were missing and the harness itself blew
 * up, which is exactly the failure they exist to detect.
 */
const expectForbidden = (fn: () => unknown) => {
  let thrown: unknown

  try {
    fn()
  } catch (error) {
    thrown = error
  }

  expect(thrown, 'expected the write to be refused').toBeDefined()
  expect((thrown as { status?: number }).status).toBe(403)
}

describe('tenantField ownership guard', () => {
  it('installs the guard as a beforeChange hook, not as a validate', () => {
    const field = makeField()

    // If this ever moves back into `validate`, draft writes stop being checked.
    expect(field.hooks?.beforeChange?.length).toBeGreaterThan(0)
  })

  it('allows a user to assign a tenant they belong to', () => {
    expect(run(guardOf(), memberOfTenantA, ALLOWED_TENANT)).toBe(ALLOWED_TENANT)
  })

  it('rejects a user assigning a tenant they do not belong to', () => {
    expectForbidden(() => run(guardOf(), memberOfTenantA, FOREIGN_TENANT))
  })

  it('rejects a foreign tenant passed as a populated relationship object', () => {
    expectForbidden(() => run(guardOf(), memberOfTenantA, { id: FOREIGN_TENANT }))
  })

  it('rejects when only one of several assigned tenants is foreign', () => {
    expectForbidden(() => run(guardOf(), memberOfTenantA, [ALLOWED_TENANT, FOREIGN_TENANT]))
  })

  it('allows a super user to assign any tenant', () => {
    expect(
      run(
        guardOf(() => true),
        memberOfTenantA,
        FOREIGN_TENANT,
      ),
    ).toBe(FOREIGN_TENANT)
  })

  it('allows system and local-API calls, which carry no user', () => {
    expect(run(guardOf(), null, FOREIGN_TENANT)).toBe(FOREIGN_TENANT)
  })

  it('allows a write that assigns no tenant, leaving presence to validate', () => {
    expect(run(guardOf(), memberOfTenantA, undefined)).toBeUndefined()
  })

  it('rejects a user with no tenants at all', () => {
    const orphan = { id: 'user-2', collection: 'users' } as unknown as UserWithTenantsField

    expectForbidden(() => run(guardOf(), orphan, FOREIGN_TENANT))
  })

  it('still guards when overrides supply their own hooks', () => {
    const field = tenantField({
      name: 'tenant',
      overrides: { hooks: { beforeChange: [({ value }) => value] } },
      tenantsArrayFieldName: 'tenants',
      tenantsArrayTenantFieldName: 'tenant',
      tenantsCollectionSlug: 'tenants',
      unique: false,
      userHasAccessToAllTenants: () => false,
    })

    // The guard must be first, so an override cannot displace or precede it.
    expect(field.hooks?.beforeChange?.length).toBe(2)
    expectForbidden(() => run(field.hooks!.beforeChange![0]!, memberOfTenantA, FOREIGN_TENANT))
  })

  it('denies by default when a call site forgets to thread the super predicate', () => {
    // A missing predicate must not silently mint a super user.
    const field = tenantField({
      name: 'tenant',
      tenantsArrayFieldName: 'tenants',
      tenantsArrayTenantFieldName: 'tenant',
      tenantsCollectionSlug: 'tenants',
      unique: false,
    } as unknown as Parameters<typeof tenantField>[0])

    expectForbidden(() => run(field.hooks!.beforeChange![0]!, memberOfTenantA, FOREIGN_TENANT))
  })

  it('guards the draft path, where validate is skipped', () => {
    // Payload sets skipValidation for a draft save, so `validate` is not called
    // at all. Reproduce that: run ONLY the hooks, exactly as
    // fields/hooks/beforeChange/promise.ts does when skipValidationFromHere is
    // true, and assert the foreign tenant is still refused.
    const field = makeField()
    const runHooksOnly = (value: unknown) => {
      let current = value
      for (const hook of field.hooks?.beforeChange ?? []) {
        const next = (hook as (args: unknown) => unknown)({
          operation: 'create',
          req: { t: undefined, user: memberOfTenantA },
          value: current,
        })
        if (next !== undefined) {
          current = next
        }
      }
      return current
    }

    expect(runHooksOnly(ALLOWED_TENANT)).toBe(ALLOWED_TENANT)
    expectForbidden(() => runHooksOnly(FOREIGN_TENANT))
  })
})
