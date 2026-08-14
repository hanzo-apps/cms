import type { CollectionConfig } from '../collections/config/types.js'
import type { Access, Config } from '../config/types.js'
import type { Where } from '../types/index.js'

import { Forbidden } from '../errors/index.js'

export const lockedDocumentsCollectionSlug = 'cms-locked-documents'

/**
 * A caller may only see and manage their OWN locks.
 *
 * This collection is registered by `sanitizeConfig`, which runs after every
 * plugin, so no plugin — the multi-tenant one included — can reach it to add a
 * scope. With the auth-only default it inherited, any authenticated caller read
 * every lock row in the database: the locked document's collection and id, the
 * identity of the user editing it, and, on a drafts collection, the inline
 * schedule-publish input. The same default let a caller create a lock on a
 * document belonging to someone else, which blocks its real owner from editing.
 *
 * Scoping by the locking user is stricter than scoping by tenant and needs no
 * knowledge of tenants, so it stays correct for every consumer of this
 * framework, tenanted or not. It also closes the lock-someone-else's-document
 * problem on the read side: a caller who cannot see a lock cannot act on it.
 */
const ownLocksAccess: Access = ({ req }) => {
  if (!req.user) {
    return false
  }

  const userValueCondition: Where = {
    'user.value': {
      equals: req.user.id,
    },
  }

  const userRelationCondition: Where = {
    'user.relationTo': {
      equals: req.user.collection,
    },
  }

  return {
    and: [userValueCondition, userRelationCondition],
  }
}

export const getLockedDocumentsCollection = (config: Config): CollectionConfig | null => {
  const lockableCollections = config
    .collections!.filter((collectionConfig) => collectionConfig.lockDocuments !== false)
    .map((collectionConfig) => collectionConfig.slug)

  const lockableGlobals = config.globals
    ? config.globals.filter((globalConfig) => globalConfig.lockDocuments !== false)
    : []

  const authCollections = config
    .collections!.filter((collectionConfig) => collectionConfig.auth)
    .map((collectionConfig) => collectionConfig.slug)

  // If there are no lockable collections AND no lockable globals, don't create the collection
  if (lockableCollections.length === 0 && lockableGlobals.length === 0) {
    return null
  }

  // If there are no auth collections, we can't track who locked the document
  // so we shouldn't create the locked-documents collection
  if (authCollections.length === 0) {
    return null
  }

  const fields: CollectionConfig['fields'] = []

  // Only include the document field if there are lockable collections
  if (lockableCollections.length > 0) {
    fields.push({
      name: 'document',
      type: 'relationship',
      index: true,
      maxDepth: 0,
      relationTo: lockableCollections,
    })
  }

  // Always include globalSlug field for tracking global locks
  fields.push({
    name: 'globalSlug',
    type: 'text',
    index: true,
  })

  // Always include user field. The owner is taken from the authenticated
  // request rather than the body, so a caller cannot file a lock under someone
  // else's name and thereby place a row outside their own read scope.
  fields.push({
    name: 'user',
    type: 'relationship',
    hooks: {
      beforeChange: [
        ({ req, value }) => {
          if (!req?.user) {
            return value
          }

          return {
            relationTo: req.user.collection,
            value: req.user.id,
          }
        },
      ],
    },
    maxDepth: 1,
    relationTo: authCollections,
    required: true,
  })

  return {
    slug: lockedDocumentsCollectionSlug,
    access: {
      create: ({ req }) => Boolean(req.user),
      delete: ownLocksAccess,
      read: ownLocksAccess,
      update: ownLocksAccess,
    },
    admin: {
      hidden: true,
    },
    fields,
    hooks: {
      beforeValidate: [
        async ({ data, operation, req }) => {
          // A caller may only lock a document they can already read. Asking the
          // target collection's own access control answers that without this
          // file knowing anything about tenants: on a tenant-scoped collection
          // the plugin's constraint is what makes a foreign document invisible,
          // and an invisible document cannot be locked.
          if (operation === 'create' && req.user && data?.document) {
            const doc = data.document as { relationTo?: string; value?: number | string }

            if (doc.relationTo && doc.value !== undefined && doc.value !== null) {
              const found = await req.cms.findByID({
                id: doc.value,
                collection: doc.relationTo,
                depth: 0,
                disableErrors: true,
                overrideAccess: false,
                req,
                user: req.user,
              })

              if (!found) {
                throw new Forbidden(req.t)
              }
            }
          }

          return data
        },
      ],
    },
    lockDocuments: false,
  }
}
