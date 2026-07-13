/* eslint-disable no-console */
import type { CollectionConfig, Field, GlobalConfig, CMS } from '@hanzo/cms'

import { migrateDocumentFieldsRecursively } from './migrateDocumentFieldsRecursively.js'

/**
 * This goes through every single collection and field in the cms config, and migrates its data from Slate to Lexical. This does not support sub-fields within slate.
 *
 * It will only translate fields fulfilling all these requirements:
 * - field schema uses lexical editor
 * - lexical editor has SlateToLexicalFeature added
 * - saved field data is in Slate format
 *
 * @param cms
 */
export async function migrateSlateToLexical({ cms }: { cms: CMS }) {
  const collections = cms.config.collections

  const errors: unknown[] = []

  const allLocales = cms.config.localization ? cms.config.localization.localeCodes : [null]

  const totalCollections = collections.length
  for (const locale of allLocales) {
    let curCollection = 0
    for (const collection of collections) {
      curCollection++
      await migrateCollection({
        collection,
        cur: curCollection,
        errors,
        locale,
        max: totalCollections,
        cms,
      })
    }
    for (const global of cms.config.globals) {
      await migrateGlobal({
        errors,
        global,
        locale,
        cms,
      })
    }
  }

  if (errors.length) {
    console.error(`Found ${errors.length} errors::`, JSON.stringify(errors, null, 2))
  } else {
    console.log('Migration successful - no errors')
  }
}

async function migrateGlobal({
  errors,
  global,
  locale,
  cms,
}: {
  errors: unknown[]
  global: GlobalConfig
  locale: null | string
  cms: CMS
}) {
  console.log(`SlateToLexical: ${locale}: Migrating global:`, global.slug)

  const document = await cms.findGlobal({
    slug: global.slug,
    depth: 0,
    draft: true,
    locale: locale || undefined,
    overrideAccess: true,
  })

  const found = migrateDocument({
    document,
    fields: global.fields,
    cms,
  })

  if (found) {
    try {
      await cms.updateGlobal({
        slug: global.slug,
        data: document,
        depth: 0,
        draft: document?._status === 'draft',
        locale: locale || undefined,
      })
      // Catch it, because some errors were caused by the user previously (e.g. invalid relationships) and will throw an error now, even though they are not related to the migration
    } catch (e) {
      console.log('Error updating global', e, {
        slug: global.slug,
      })
      errors.push(e)
    }
  }
}

async function migrateCollection({
  collection,
  cur,
  errors,
  locale,
  max,
  cms,
}: {
  collection: CollectionConfig
  cur: number
  errors: unknown[]
  locale: null | string
  max: number
  cms: CMS
}) {
  console.log(
    `SlateToLexical: ${locale}: Migrating collection:`,
    collection.slug,
    '(' + cur + '/' + max + ')',
  )

  const documentCount = (
    await cms.count({
      collection: collection.slug,
      locale: locale || undefined,
    })
  ).totalDocs

  let page = 1
  let migrated = 0

  while (migrated < documentCount) {
    const documents = await cms.find({
      collection: collection.slug,
      depth: 0,
      draft: true,
      locale: locale || undefined,
      overrideAccess: true,
      page,
      pagination: true,
    })

    for (const document of documents.docs) {
      migrated++
      console.log(
        `SlateToLexical: ${locale}: Migrating collection:`,
        collection.slug,
        '(' +
          cur +
          '/' +
          max +
          ') - Migrating Document: ' +
          document.id +
          ' (' +
          migrated +
          '/' +
          documentCount +
          ')',
      )
      const found = migrateDocument({
        document,
        fields: collection.fields,
        cms,
      })

      if (found) {
        try {
          await cms.update({
            id: document.id,
            collection: collection.slug,
            data: document,
            depth: 0,
            draft: document?._status === 'draft',
            locale: locale || undefined,
          })
          // Catch it, because some errors were caused by the user previously (e.g. invalid relationships) and will throw an error now, even though they are not related to the migration
        } catch (e) {
          errors.push(e)

          console.log('Error updating collection', e, {
            id: document.id,
            slug: collection.slug,
          })
        }
      }
    }
    page++
  }
}

function migrateDocument({
  document,
  fields,
  cms,
}: {
  document: Record<string, unknown>
  fields: Field[]
  cms: CMS
}): boolean {
  return !!migrateDocumentFieldsRecursively({
    data: document,
    fields,
    found: 0,
    cms,
  })
}
