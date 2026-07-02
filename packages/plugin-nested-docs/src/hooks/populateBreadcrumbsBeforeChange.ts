import type { CollectionBeforeChangeHook } from '@hanzo/cms'

import type { NestedDocsPluginConfig } from '../types.js'

import { populateBreadcrumbs } from '../utilities/populateBreadcrumbs.js'

export const populateBreadcrumbsBeforeChange =
  (pluginConfig: NestedDocsPluginConfig): CollectionBeforeChangeHook =>
  async ({ collection, data, originalDoc, req }) =>
    populateBreadcrumbs({
      breadcrumbsFieldName: pluginConfig.breadcrumbsFieldSlug,
      collection,
      data,
      generateLabel: pluginConfig.generateLabel,
      generateURL: pluginConfig.generateURL,
      originalDoc,
      parentFieldName: pluginConfig.parentFieldSlug,
      req,
    })
