import type { FlattenedField, CMS, CMSRequest } from '@hanzo/cms'

import type { BasePostgresAdapter, PostgresDB } from '../../../types.js'
import type { DocsToResave } from '../types.js'

import { upsertRow } from '../../../../upsertRow/index.js'
import { traverseFields } from './traverseFields.js'

type Args = {
  adapter: BasePostgresAdapter
  collectionSlug?: string
  db: PostgresDB
  debug: boolean
  docsToResave: DocsToResave
  fields: FlattenedField[]
  globalSlug?: string
  isVersions: boolean
  cms: CMS
  req?: Partial<CMSRequest>
  tableName: string
}

export const fetchAndResave = async ({
  adapter,
  collectionSlug,
  db,
  debug,
  docsToResave,
  fields,
  globalSlug,
  isVersions,
  cms,
  req,
  tableName,
}: Args) => {
  for (const [id, rows] of Object.entries(docsToResave)) {
    if (collectionSlug) {
      const collectionConfig = cms.collections[collectionSlug].config

      if (collectionConfig) {
        if (isVersions) {
          const doc = await cms.findVersionByID({
            id,
            collection: collectionSlug,
            depth: 0,
            fallbackLocale: null,
            locale: 'all',
            req,
            showHiddenFields: true,
          })

          if (debug) {
            cms.logger.info(
              `The collection "${collectionConfig.slug}" version with ID ${id} will be migrated`,
            )
          }

          traverseFields({
            doc,
            fields,
            path: '',
            rows,
          })

          try {
            await upsertRow({
              id: doc.id,
              adapter,
              collectionSlug,
              data: doc,
              db,
              fields,
              ignoreResult: true,
              operation: 'update',
              req,
              tableName,
            })
          } catch (err) {
            cms.logger.error(
              `"${collectionConfig.slug}" version with ID ${doc.id} FAILED TO MIGRATE`,
            )

            throw err
          }

          if (debug) {
            cms.logger.info(
              `"${collectionConfig.slug}" version with ID ${doc.id} migrated successfully!`,
            )
          }
        } else {
          const doc = await cms.findByID({
            id,
            collection: collectionSlug,
            depth: 0,
            fallbackLocale: null,
            locale: 'all',
            req,
            showHiddenFields: true,
          })

          if (debug) {
            cms.logger.info(
              `The collection "${collectionConfig.slug}" with ID ${doc.id} will be migrated`,
            )
          }

          traverseFields({
            doc,
            fields,
            path: '',
            rows,
          })

          try {
            await upsertRow({
              id: doc.id,
              adapter,
              collectionSlug,
              data: doc,
              db,
              fields,
              ignoreResult: true,
              operation: 'update',
              req,
              tableName,
            })
          } catch (err) {
            cms.logger.error(
              `The collection "${collectionConfig.slug}" with ID ${doc.id} has FAILED TO MIGRATE`,
            )

            throw err
          }

          if (debug) {
            cms.logger.info(
              `The collection "${collectionConfig.slug}" with ID ${doc.id} has migrated successfully!`,
            )
          }
        }
      }
    }

    if (globalSlug) {
      const globalConfig = cms.config.globals?.find((global) => global.slug === globalSlug)

      if (globalConfig) {
        if (isVersions) {
          const { docs } = await cms.findGlobalVersions({
            slug: globalSlug,
            depth: 0,
            fallbackLocale: null,
            limit: 0,
            locale: 'all',
            req,
            showHiddenFields: true,
          })

          if (debug) {
            cms.logger.info(`${docs.length} global "${globalSlug}" versions will be migrated`)
          }

          for (const doc of docs) {
            traverseFields({
              doc,
              fields,
              path: '',
              rows,
            })

            try {
              await upsertRow({
                id: doc.id,
                adapter,
                data: doc,
                db,
                fields,
                globalSlug,
                ignoreResult: true,
                operation: 'update',
                req,
                tableName,
              })
            } catch (err) {
              cms.logger.error(`"${globalSlug}" version with ID ${doc.id} FAILED TO MIGRATE`)

              throw err
            }

            if (debug) {
              cms.logger.info(
                `"${globalSlug}" version with ID ${doc.id} migrated successfully!`,
              )
            }
          }
        } else {
          const doc = await cms.findGlobal({
            slug: globalSlug,
            depth: 0,
            fallbackLocale: null,
            locale: 'all',
            req,
            showHiddenFields: true,
          })

          traverseFields({
            doc,
            fields,
            path: '',
            rows,
          })

          try {
            await upsertRow({
              adapter,
              data: doc,
              db,
              fields,
              globalSlug,
              ignoreResult: true,
              operation: 'update',
              req,
              tableName,
            })
          } catch (err) {
            cms.logger.error(`The global "${globalSlug}" has FAILED TO MIGRATE`)

            throw err
          }

          if (debug) {
            cms.logger.info(`The global "${globalSlug}" has migrated successfully!`)
          }
        }
      }
    }
  }
}
