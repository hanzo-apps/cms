import type { CollectionConfig, Field, GlobalConfig, CMS } from '@hanzo/cms'

import { upgradeDocumentFieldsRecursively } from './upgradeDocumentFieldsRecursively.js'

/**
 * This goes through every single document in your cms app and re-saves it, if it has a lexical editor.
 * This way, the data is automatically converted to the new format, and that automatic conversion gets applied to every single document in your app.
 *
 * @param cms
 */
export async function upgradeLexicalData({ cms }: { cms: CMS }) {
  const collections = cms.config.collections

  const allLocales = cms.config.localization ? cms.config.localization.localeCodes : [null]

  const totalCollections = collections.length
  for (const locale of allLocales) {
    let curCollection = 0
    for (const collection of collections) {
      curCollection++
      await upgradeCollection({
        collection,
        cur: curCollection,
        locale,
        max: totalCollections,
        cms,
      })
    }
    for (const global of cms.config.globals) {
      await upgradeGlobal({
        global,
        locale,
        cms,
      })
    }
  }
}

async function upgradeGlobal({
  global,
  locale,
  cms,
}: {
  global: GlobalConfig
  locale: null | string
  cms: CMS
}) {
  console.log(`Lexical Upgrader: ${locale}: Upgrading global:`, global.slug)

  const document = await cms.findGlobal({
    slug: global.slug,
    depth: 0,
    locale: locale || undefined,
    overrideAccess: true,
  })

  const found = upgradeDocument({
    document,
    fields: global.fields,
    cms,
  })

  if (found) {
    await cms.updateGlobal({
      slug: global.slug,
      data: document,
      depth: 0,
      locale: locale || undefined,
    })
  }
}

async function upgradeCollection({
  collection,
  cur,
  locale,
  max,
  cms,
}: {
  collection: CollectionConfig
  cur: number
  locale: null | string
  max: number
  cms: CMS
}) {
  console.log(
    `Lexical Upgrade: ${locale}: Upgrading collection:`,
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
  let upgraded = 0

  while (upgraded < documentCount) {
    const documents = await cms.find({
      collection: collection.slug,
      depth: 0,
      locale: locale || undefined,
      overrideAccess: true,
      page,
      pagination: true,
    })

    for (const document of documents.docs) {
      upgraded++
      console.log(
        `Lexical Upgrade: ${locale}: Upgrading collection:`,
        collection.slug,
        '(' +
          cur +
          '/' +
          max +
          ') - Upgrading Document: ' +
          document.id +
          ' (' +
          upgraded +
          '/' +
          documentCount +
          ')',
      )
      const found = upgradeDocument({
        document,
        fields: collection.fields,
        cms,
      })

      if (found) {
        await cms.update({
          id: document.id,
          collection: collection.slug,
          data: document,
          depth: 0,
          locale: locale || undefined,
        })
      }
    }
    page++
  }
}

function upgradeDocument({
  document,
  fields,
  cms,
}: {
  document: Record<string, unknown>
  fields: Field[]
  cms: CMS
}): boolean {
  return !!upgradeDocumentFieldsRecursively({
    data: document,
    fields,
    found: 0,
    cms,
  })
}
