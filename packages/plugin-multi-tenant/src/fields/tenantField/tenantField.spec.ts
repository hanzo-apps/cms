import { describe, expect, it } from 'vitest'

import { tenantField } from './index.js'

/**
 * Cross-tenant WRITE guard: the tenant field's validate must reject an
 * authenticated non-super user assigning a tenant they do not belong to.
 * Without this, the REST/GraphQL API accepts an arbitrary `tenant` value and
 * one org can write documents into another org's tenant (cross-tenant breach).
 */
const buildValidate = () => {
  const field = tenantField({
    name: 'tenant',
    tenantsArrayFieldName: 'tenants',
    tenantsArrayTenantFieldName: 'tenant',
    tenantsCollectionSlug: 'tenants',
    unique: false,
    userHasAccessToAllTenants: (user) => Boolean((user as { isSuper?: boolean })?.isSuper),
  })
  return field.validate as (
    value: unknown,
    options: unknown,
  ) => Promise<string | true> | (string | true)
}

const req = (user: unknown) => ({ hasMany: false, req: { t: () => 'REQUIRED', user } })
const member = { id: 'u1', tenants: [{ tenant: 'orgA' }] }

describe('tenantField.validate — tenant-ownership enforcement', () => {
  it('allows a member to assign their OWN tenant (id form)', async () => {
    expect(await buildValidate()('orgA', req(member))).toBe(true)
  })

  it('allows a member to assign their OWN tenant (object form)', async () => {
    expect(await buildValidate()({ id: 'orgA' }, req(member))).toBe(true)
  })

  it('REJECTS a member assigning a foreign tenant (cross-tenant write)', async () => {
    expect(await buildValidate()('orgB', req(member))).toBe('REQUIRED')
  })

  it('REJECTS a member assigning a foreign tenant (object form)', async () => {
    expect(await buildValidate()({ id: 'orgB' }, req(member))).toBe('REQUIRED')
  })

  it('allows a super user (userHasAccessToAllTenants) to assign any tenant', async () => {
    expect(await buildValidate()('orgB', req({ id: 'admin', isSuper: true, tenants: [] }))).toBe(
      true,
    )
  })

  it('skips ownership enforcement for system/local-API calls (no user)', async () => {
    expect(await buildValidate()('orgB', req(null))).toBe(true)
  })

  it('still enforces required (empty value) before ownership', async () => {
    expect(await buildValidate()(undefined, req(member))).toBe('REQUIRED')
  })
})
