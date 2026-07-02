import type { CollectionConfig } from '../collections/config/types.js'
import type { Access, Config } from '../config/types.js'
import type { Where } from '../types/index.js'

import { Forbidden } from '../errors/index.js'

export const lockedDocumentsCollectionSlug = 'payload-locked-documents'

/**
 * A user may only see/manage their OWN locks.
 *
 * Previously this collection used auth-only `defaultAccess`, so ANY authenticated
 * user could read every lock (leaking other tenants' locked doc IDs + the editing
 * user + inline schedulePublish inputs) and create locks on other tenants' docs
 * (cross-tenant edit-DoS). Self-scoping by the locking user closes the read leak
 * and — since a foreign user can no longer SEE another user's lock — neutralizes
 * the DoS. Generic (by user), no tenant coupling.
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

  // Always include user field. Forced to the authenticated user on write so a
  // client can never attribute a lock to another user (locks are self-owned).
  fields.push({
    name: 'user',
    type: 'relationship',
    hooks: {
      beforeValidate: [
        ({ req }) => {
          if (!req?.user) {
            return null
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
          // A user may only lock a document they can actually READ. Reuse the
          // target collection's own access control (tenant-scoped for
          // tenant-enabled collections) — generic, no tenant logic here. Blocks
          // creating a lock on another tenant's document (cross-tenant DoS).
          if (operation === 'create' && req.user && data?.document) {
            const doc = data.document as { relationTo?: string; value?: number | string }
            if (doc.relationTo && doc.value !== undefined && doc.value !== null) {
              const found = await req.payload.findByID({
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
