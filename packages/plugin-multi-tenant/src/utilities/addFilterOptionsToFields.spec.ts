import type { Config } from '@hanzo/cms'

import { describe, expect, it } from 'vitest'

import { addFilterOptionsToFields } from './addFilterOptionsToFields.js'

/**
 * A tenant-enabled collection that declares no fields of its own.
 *
 * `fields` is optional on an incoming CollectionConfig and Payload does not
 * default it to [] until sanitize, which runs after every plugin — so this
 * plugin is handed `undefined` for, say, an upload-only Media collection. The
 * loop inside threw `fields is not iterable`, which surfaces as a 500 on the
 * first request and reads to the liveness probe as a dead container, i.e. a
 * crash loop rather than a config error at build time.
 */
const baseArgs = {
  blockReferencesWithFilters: [],
  config: { collections: [] } as unknown as Config,
  tenantEnabledCollectionSlugs: ['media'],
  tenantEnabledGlobalSlugs: [],
  tenantFieldName: 'tenant',
  tenantsArrayFieldName: 'tenants',
  tenantsArrayTenantFieldName: 'tenant',
  tenantsCollectionSlug: 'tenants',
  userHasAccessToAllTenants: () => false,
}

describe('addFilterOptionsToFields', () => {
  it('returns an empty array for a collection that declares no fields', () => {
    const result = addFilterOptionsToFields({ ...baseArgs, fields: undefined })

    // The caller assigns this back to collection.fields and then unshifts the
    // tenant field into it, so it has to be an array, not undefined.
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(0)
    expect(() =>
      result.unshift({ name: 'tenant', type: 'relationship', relationTo: 'tenants' }),
    ).not.toThrow()
  })

  it('passes through a collection that does declare fields', () => {
    const result = addFilterOptionsToFields({
      ...baseArgs,
      fields: [{ name: 'alt', type: 'text' }],
    })

    expect(result.map((field) => 'name' in field && field.name)).toEqual(['alt'])
  })
})
