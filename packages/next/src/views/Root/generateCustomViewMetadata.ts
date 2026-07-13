import type { I18nClient } from '@hanzo/cms-translations'
import type { Metadata } from 'next'
import type {
  AdminViewConfig,
  SanitizedCollectionConfig,
  SanitizedConfig,
  SanitizedGlobalConfig,
} from '@hanzo/cms'

import { generateMetadata } from '../../utilities/meta.js'

export const generateCustomViewMetadata = async (args: {
  collectionConfig?: SanitizedCollectionConfig
  config: SanitizedConfig
  globalConfig?: SanitizedGlobalConfig
  i18n: I18nClient
  viewConfig: AdminViewConfig
}): Promise<Metadata> => {
  const {
    config,
    // i18n: { t },
    viewConfig,
  } = args

  if (!viewConfig) {
    return null
  }

  return generateMetadata({
    description: `CMS`,
    keywords: `CMS`,
    serverURL: config.serverURL,
    title: 'CMS',
    ...(config.admin.meta || {}),
    ...(viewConfig.meta || {}),
    openGraph: {
      title: 'CMS',
      ...(config.admin.meta?.openGraph || {}),
      ...(viewConfig.meta?.openGraph || {}),
    },
  })
}
