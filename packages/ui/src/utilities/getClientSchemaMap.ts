import type { I18n, I18nClient } from '@hanzo/cms-translations'
import type { ClientConfig, ClientFieldSchemaMap, FieldSchemaMap, CMS } from '@hanzo/cms'

import { cache } from 'react'

import { buildClientFieldSchemaMap } from './buildClientFieldSchemaMap/index.js'

let cachedClientSchemaMap = global._cms_clientSchemaMap

if (!cachedClientSchemaMap) {
  cachedClientSchemaMap = global._cms_clientSchemaMap = null
}

export const getClientSchemaMap = cache(
  (args: {
    collectionSlug?: string
    config: ClientConfig
    globalSlug?: string
    i18n: I18nClient
    cms: CMS
    schemaMap: FieldSchemaMap
    widgetSlug?: string
  }): ClientFieldSchemaMap => {
    const { collectionSlug, config, globalSlug, i18n, cms, schemaMap, widgetSlug } = args

    if (!cachedClientSchemaMap || global._cms_doNotCacheClientSchemaMap) {
      cachedClientSchemaMap = new Map()
    }

    const cacheKey = collectionSlug || globalSlug || `widget:${widgetSlug}`
    let cachedEntityClientFieldMap = cachedClientSchemaMap.get(cacheKey)

    if (cachedEntityClientFieldMap) {
      return cachedEntityClientFieldMap
    }

    cachedEntityClientFieldMap = new Map()

    const { clientFieldSchemaMap: entityClientFieldMap } = buildClientFieldSchemaMap({
      collectionSlug,
      config,
      globalSlug,
      i18n: i18n as I18n,
      cms,
      schemaMap,
      widgetSlug,
    })

    cachedClientSchemaMap.set(cacheKey, entityClientFieldMap)

    global._cms_clientSchemaMap = cachedClientSchemaMap

    global._cms_doNotCacheClientSchemaMap = false

    return entityClientFieldMap
  },
)
