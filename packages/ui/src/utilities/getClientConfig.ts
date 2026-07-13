import type { SupportedLanguages } from '@hanzo/cms-translations'
import type { ClientConfig, CreateClientConfigArgs } from '@hanzo/cms'

import { createClientConfig, createUnauthenticatedClientConfig } from '@hanzo/cms'
import { cache } from 'react'

type CachedClientConfigs = Record<keyof SupportedLanguages, ClientConfig>

let cachedClientConfigs = global._cms_clientConfigs as CachedClientConfigs

if (!cachedClientConfigs) {
  cachedClientConfigs = global._cms_clientConfigs = {} as CachedClientConfigs
}

export const getClientConfig = cache(
  ({ config, i18n, importMap, user }: CreateClientConfigArgs): ClientConfig => {
    const currentLanguage = i18n.language

    if (cachedClientConfigs[currentLanguage] && !global._cms_doNotCacheClientConfig) {
      if (!user) {
        return createUnauthenticatedClientConfig({
          clientConfig: cachedClientConfigs[currentLanguage],
        }) as unknown as ClientConfig
      }

      return cachedClientConfigs[currentLanguage]
    }

    const cachedClientConfig = createClientConfig({
      config,
      i18n,
      importMap,
      user,
    })

    cachedClientConfigs[currentLanguage] = cachedClientConfig
    global._cms_clientConfigs = cachedClientConfigs
    global._cms_doNotCacheClientConfig = false

    if (!user) {
      return createUnauthenticatedClientConfig({
        clientConfig: cachedClientConfig,
      }) as unknown as ClientConfig
    }

    return cachedClientConfig
  },
)
