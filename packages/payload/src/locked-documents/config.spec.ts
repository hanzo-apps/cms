import type { Config } from '../config/types.js'
import { describe, it, expect } from 'vitest'
import { getLockedDocumentsCollection } from './config.js'

describe('getLockedDocumentsCollection', () => {
  it('should return null when no lockable collections or globals exist', () => {
    const config: Config = {
      collections: [
        {
          slug: 'posts',
          lockDocuments: false,
          fields: [],
        },
        {
          slug: 'pages',
          lockDocuments: false,
          fields: [],
        },
      ],
      globals: [
        {
          slug: 'settings',
          lockDocuments: false,
          fields: [],
        },
      ],
    } as Config

    const result = getLockedDocumentsCollection(config)

    expect(result).toBeNull()
  })

  it('should return null when no auth collections exist', () => {
    const config: Config = {
      collections: [
        {
          slug: 'posts',
          lockDocuments: true,
          fields: [],
        },
        {
          slug: 'pages',
          lockDocuments: { duration: 600 },
          fields: [],
        },
      ],
    } as Config

    const result = getLockedDocumentsCollection(config)

    expect(result).toBeNull()
  })

  it('should return collection config when lockable and auth collections exist', () => {
    const config: Config = {
      collections: [
        {
          slug: 'posts',
          lockDocuments: true,
          fields: [],
        },
        {
          slug: 'pages',
          lockDocuments: { duration: 600 },
          fields: [],
        },
        {
          slug: 'users',
          auth: true,
          fields: [],
        },
      ],
    } as Config

    const result = getLockedDocumentsCollection(config)

    expect(result).not.toBeNull()
    expect(result?.slug).toBe('cms-locked-documents')
    expect(result?.fields).toHaveLength(3)

    // Check document field
    const documentField = result?.fields.find((f) => 'name' in f && f.name === 'document')
    expect(documentField).toBeDefined()
    expect(documentField?.type).toBe('relationship')
    if (documentField?.type === 'relationship') {
      expect(documentField.relationTo).toEqual(['posts', 'pages', 'users'])
    }

    // Check user field
    const userField = result?.fields.find((f) => 'name' in f && f.name === 'user')
    expect(userField).toBeDefined()
    expect(userField?.type).toBe('relationship')
    if (userField?.type === 'relationship') {
      expect(userField.relationTo).toEqual(['users'])
    }
  })

  it('should only include collections with lockDocuments !== false', () => {
    const config: Config = {
      collections: [
        {
          slug: 'posts',
          lockDocuments: true,
          fields: [],
        },
        {
          slug: 'pages',
          lockDocuments: false,
          fields: [],
        },
        {
          slug: 'articles',
          // lockDocuments undefined (defaults to true)
          fields: [],
        },
        {
          slug: 'users',
          auth: true,
          fields: [],
        },
      ],
    } as Config

    const result = getLockedDocumentsCollection(config)

    expect(result).not.toBeNull()

    const documentField = result?.fields.find((f) => 'name' in f && f.name === 'document')
    if (documentField?.type === 'relationship') {
      expect(documentField.relationTo).toEqual(['posts', 'articles', 'users'])
      expect(documentField.relationTo).not.toContain('pages')
    }
  })

  it('should include multiple auth collections', () => {
    const config: Config = {
      collections: [
        {
          slug: 'posts',
          lockDocuments: true,
          fields: [],
        },
        {
          slug: 'users',
          auth: true,
          fields: [],
        },
        {
          slug: 'admins',
          auth: { loginWithUsername: true },
          fields: [],
        },
      ],
    } as Config

    const result = getLockedDocumentsCollection(config)

    expect(result).not.toBeNull()

    const userField = result?.fields.find((f) => 'name' in f && f.name === 'user')
    if (userField?.type === 'relationship') {
      expect(userField.relationTo).toEqual(['users', 'admins'])
    }
  })

  it('should set lockDocuments to false on the locked-documents collection itself', () => {
    const config: Config = {
      collections: [
        {
          slug: 'posts',
          lockDocuments: true,
          fields: [],
        },
        {
          slug: 'users',
          auth: true,
          fields: [],
        },
      ],
    } as Config

    const result = getLockedDocumentsCollection(config)

    expect(result).not.toBeNull()
    expect(result?.lockDocuments).toBe(false)
  })

  it('should create collection when only globals have lockDocuments enabled', () => {
    const config: Config = {
      collections: [
        {
          slug: 'posts',
          lockDocuments: false,
          fields: [],
        },
        {
          slug: 'users',
          auth: true,
          lockDocuments: false,
          fields: [],
        },
      ],
      globals: [
        {
          slug: 'settings',
          lockDocuments: true,
          fields: [],
        },
        {
          slug: 'menu',
          lockDocuments: { duration: 600 },
          fields: [],
        },
      ],
    } as Config

    const result = getLockedDocumentsCollection(config)

    expect(result).not.toBeNull()
    expect(result?.slug).toBe('cms-locked-documents')

    // Should NOT have a document field since no lockable collections
    const documentField = result?.fields.find((f) => 'name' in f && f.name === 'document')
    expect(documentField).toBeUndefined()

    // Should have globalSlug field
    const globalSlugField = result?.fields.find((f) => 'name' in f && f.name === 'globalSlug')
    expect(globalSlugField).toBeDefined()

    // Should have user field
    const userField = result?.fields.find((f) => 'name' in f && f.name === 'user')
    expect(userField).toBeDefined()
  })

  it('should include document field when lockable collections exist', () => {
    const config: Config = {
      collections: [
        {
          slug: 'posts',
          lockDocuments: true,
          fields: [],
        },
        {
          slug: 'users',
          auth: true,
          fields: [],
        },
      ],
      globals: [
        {
          slug: 'settings',
          lockDocuments: false,
          fields: [],
        },
      ],
    } as Config

    const result = getLockedDocumentsCollection(config)

    expect(result).not.toBeNull()

    // Should have document field
    const documentField = result?.fields.find((f) => 'name' in f && f.name === 'document')
    expect(documentField).toBeDefined()
    expect(documentField?.type).toBe('relationship')
    if (documentField?.type === 'relationship') {
      expect(documentField.relationTo).toEqual(['posts', 'users'])
    }

    // Should have globalSlug field
    const globalSlugField = result?.fields.find((f) => 'name' in f && f.name === 'globalSlug')
    expect(globalSlugField).toBeDefined()
  })

  it('should include document field when both lockable collections and globals exist', () => {
    const config: Config = {
      collections: [
        {
          slug: 'posts',
          lockDocuments: true,
          fields: [],
        },
        {
          slug: 'users',
          auth: true,
          fields: [],
        },
      ],
      globals: [
        {
          slug: 'settings',
          lockDocuments: true,
          fields: [],
        },
      ],
    } as Config

    const result = getLockedDocumentsCollection(config)

    expect(result).not.toBeNull()

    // Should have document field for collections
    const documentField = result?.fields.find((f) => 'name' in f && f.name === 'document')
    expect(documentField).toBeDefined()

    // Should have globalSlug field for globals
    const globalSlugField = result?.fields.find((f) => 'name' in f && f.name === 'globalSlug')
    expect(globalSlugField).toBeDefined()
  })
})

/**
 * Isolation of the locked-documents collection.
 *
 * This collection is registered by sanitizeConfig, which runs after every
 * plugin, so no plugin can reach it to add a scope. With the auth-only default
 * it inherited, any authenticated caller could read every lock row in the
 * database and create locks on documents belonging to other people.
 */
describe('getLockedDocumentsCollection isolation', () => {
  const config: Config = {
    collections: [
      { slug: 'pages', fields: [], lockDocuments: true },
      { slug: 'users', auth: true, fields: [] },
    ],
  } as Config

  const collection = () => {
    const result = getLockedDocumentsCollection(config)

    if (!result) {
      throw new Error('expected a locked-documents collection')
    }

    return result
  }

  const asUser = (id: string) => ({ req: { user: { id, collection: 'users' } } })

  it('scopes read, update and delete to the caller', () => {
    const { access } = collection()

    for (const operation of ['read', 'update', 'delete'] as const) {
      const result = access![operation]!(asUser('user-1') as never)

      // A Where constraint, not a bare `true` — a boolean here would return
      // every tenant's locks.
      expect(result, `${operation} must return a constraint`).not.toBe(true)
      expect(result).toEqual({
        and: [{ 'user.value': { equals: 'user-1' } }, { 'user.relationTo': { equals: 'users' } }],
      })
    }
  })

  it('denies an anonymous caller outright', () => {
    const { access } = collection()

    for (const operation of ['read', 'update', 'delete'] as const) {
      expect(access![operation]!({ req: { user: null } } as never)).toBe(false)
    }
  })

  it('takes the lock owner from the request rather than the body', () => {
    const userField = collection().fields.find((f) => 'name' in f && f.name === 'user')
    const hook = (userField as { hooks?: { beforeChange?: unknown[] } }).hooks?.beforeChange?.[0]

    expect(hook, 'user field must force its owner').toBeDefined()

    const forced = (hook as (args: unknown) => unknown)({
      req: { user: { id: 'user-1', collection: 'users' } },
      value: { relationTo: 'users', value: 'victim' },
    })

    expect(forced).toEqual({ relationTo: 'users', value: 'user-1' })
  })

  it('refuses to lock a document the caller cannot read', async () => {
    const hook = collection().hooks!.beforeValidate![0]!
    // findByID with overrideAccess:false is what applies the target
    // collection's own scoping; a foreign document resolves to null.
    const req = {
      cms: { findByID: () => Promise.resolve(null) },
      t: undefined,
      user: { id: 'user-1', collection: 'users' },
    }

    await expect(
      (hook as (args: unknown) => Promise<unknown>)({
        data: { document: { relationTo: 'pages', value: 'foreign-page' } },
        operation: 'create',
        req,
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('allows locking a document the caller can read', async () => {
    const hook = collection().hooks!.beforeValidate![0]!
    const req = {
      cms: { findByID: () => Promise.resolve({ id: 'own-page' }) },
      t: undefined,
      user: { id: 'user-1', collection: 'users' },
    }
    const data = { document: { relationTo: 'pages', value: 'own-page' } }

    await expect(
      (hook as (args: unknown) => Promise<unknown>)({ data, operation: 'create', req }),
    ).resolves.toEqual(data)
  })
})
