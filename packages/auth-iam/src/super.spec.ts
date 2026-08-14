import { describe, expect, it } from 'vitest'

import { isSuperAdmin } from './super.js'

/**
 * `iamOrg` names the org a principal belongs to; `isAdmin` says they administer
 * that org. Only `iamOrg` can name the reserved `admin` org, so only `iamOrg`
 * crosses a tenant boundary.
 */

const orgAdmin = { iamOrg: 'acme', isAdmin: true }
const orgMember = { iamOrg: 'acme', isAdmin: false }
const superAdmin = { iamOrg: 'admin', isAdmin: false }

describe('isSuperAdmin', () => {
  it('grants membership in the reserved admin org', () => {
    expect(isSuperAdmin(superAdmin)).toBe(true)
  })

  it('does NOT grant on isAdmin alone', () => {
    expect(isSuperAdmin(orgAdmin)).toBe(false)
  })

  it('matches the reserved org exactly, not a tenant slug resembling it', () => {
    expect(isSuperAdmin({ iamOrg: 'admins', isAdmin: true })).toBe(false)
    expect(isSuperAdmin({ iamOrg: 'Admin', isAdmin: true })).toBe(false)
  })

  it('does not grant to an ordinary org member', () => {
    expect(isSuperAdmin(orgMember)).toBe(false)
  })

  it('does not grant to a principal carrying no org', () => {
    expect(isSuperAdmin({ isAdmin: true })).toBe(false)
    expect(isSuperAdmin({})).toBe(false)
  })

  it('does not grant to an absent principal', () => {
    expect(isSuperAdmin(null)).toBe(false)
    expect(isSuperAdmin(undefined)).toBe(false)
  })
})
