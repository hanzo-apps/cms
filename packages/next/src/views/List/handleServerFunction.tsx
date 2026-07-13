import type { RenderListServerFnArgs, RenderListServerFnReturnType } from '@hanzo/cms-ui'
import type { CollectionPreferences, ServerFunction, VisibleEntities } from '@hanzo/cms'

import { getClientConfig } from '@hanzo/cms-ui/utilities/getClientConfig'
import { canAccessAdmin, isEntityHidden, UnauthorizedError } from '@hanzo/cms'
import { applyLocaleFiltering } from '@hanzo/cms/shared'

import { renderListView } from './index.js'

export const renderListHandler: ServerFunction<
  RenderListServerFnArgs,
  Promise<RenderListServerFnReturnType>
> = async (args) => {
  const {
    collectionSlug,
    cookies,
    disableActions,
    disableBulkDelete,
    disableBulkEdit,
    disableQueryPresets,
    drawerSlug,
    enableRowSelections,
    locale,
    overrideEntityVisibility,
    permissions,
    query,
    redirectAfterDelete,
    redirectAfterDuplicate,
    req,
    req: {
      i18n,
      cms,
      cms: { config },
      user,
    },
  } = args

  if (!req.user) {
    throw new UnauthorizedError()
  }

  await canAccessAdmin({ req })

  const clientConfig = getClientConfig({
    config,
    i18n,
    importMap: cms.importMap,
    user,
  })
  await applyLocaleFiltering({ clientConfig, config, req })

  const preferencesKey = `collection-${collectionSlug}`

  const preferences = await cms
    .find({
      collection: 'cms-preferences',
      depth: 0,
      limit: 1,
      where: {
        and: [
          {
            key: {
              equals: preferencesKey,
            },
          },
          {
            'user.relationTo': {
              equals: user.collection,
            },
          },
          {
            'user.value': {
              equals: user.id,
            },
          },
        ],
      },
    })
    .then((res) => res.docs[0]?.value as CollectionPreferences)

  const visibleEntities: VisibleEntities = {
    collections: cms.config.collections
      .map(({ slug, admin: { hidden } }) => (!isEntityHidden({ hidden, user }) ? slug : null))
      .filter(Boolean),
    globals: cms.config.globals
      .map(({ slug, admin: { hidden } }) => (!isEntityHidden({ hidden, user }) ? slug : null))
      .filter(Boolean),
  }

  const { List } = await renderListView({
    clientConfig,
    disableActions,
    disableBulkDelete,
    disableBulkEdit,
    disableQueryPresets,
    drawerSlug,
    enableRowSelections,
    i18n,
    importMap: cms.importMap,
    initPageResult: {
      collectionConfig: cms?.collections?.[collectionSlug]?.config,
      cookies,
      globalConfig: cms.config.globals.find((global) => global.slug === collectionSlug),
      languageOptions: undefined, // TODO
      locale,
      permissions,
      req,
      translations: undefined, // TODO
      visibleEntities,
    },
    locale,
    overrideEntityVisibility,
    params: {
      segments: ['collections', collectionSlug],
    },
    cms,
    permissions,
    query,
    redirectAfterDelete,
    redirectAfterDuplicate,
    searchParams: {},
    viewType: 'list',
  })

  return {
    List,
    preferences,
  }
}
