import type { Config } from '@hanzo/cms'

import type { WhiteLabelPluginConfig } from './types.js'

import { resolveBrand } from './resolveBrand.js'

export type { Brand, WhiteLabelPluginConfig } from './types.js'
export { brandThemeCSS, resolveBrand } from './resolveBrand.js'

/**
 * White-label plugin.
 *
 * Resolves the active brand for THIS deployment (by `hostEnvVar`, defaulting to
 * HANZO_CMS_HOST / VERCEL_URL) and injects the brand's logo, icon, name and
 * meta into the admin config. When nothing resolves, the config is returned
 * untouched — the fork's brand-neutral defaults apply.
 *
 * This is the shared-infra white-label rule (like KMS/IAM/Base): one product,
 * many brands, selected by domain. Never hardcodes any single brand.
 *
 * For a SINGLE deployment serving MULTIPLE brands, point `admin.components.
 * graphics.Logo/Icon` at your own dispatcher components and call `resolveBrand`
 * inside them with the per-request host — this plugin's static injection then
 * only supplies the fallback.
 */
export const whiteLabelPlugin =
  (pluginConfig: WhiteLabelPluginConfig) =>
  (incomingConfig: Config): Config => {
    if (pluginConfig.enabled === false) {
      return incomingConfig
    }

    const host =
      (pluginConfig.hostEnvVar ? process.env[pluginConfig.hostEnvVar] : undefined) ??
      process.env.HANZO_CMS_HOST ??
      process.env.VERCEL_URL ??
      undefined

    const brand = resolveBrand(pluginConfig.brands, host)

    // Nothing to apply → keep neutral defaults.
    if (!brand) {
      return incomingConfig
    }

    const config = incomingConfig
    config.admin = config.admin || {}
    config.admin.components = config.admin.components || {}
    config.admin.components.graphics = config.admin.components.graphics || {}
    config.admin.meta = config.admin.meta || {}

    if (brand.logo) {
      config.admin.components.graphics.Logo = brand.logo
    }
    if (brand.icon) {
      config.admin.components.graphics.Icon = brand.icon
    }
    if (brand.name) {
      config.admin.meta.titleSuffix = `— ${brand.name}`
    }
    if (brand.favicon) {
      config.admin.meta.icons = [{ type: 'image/svg+xml', rel: 'icon', url: brand.favicon }]
    }
    if (brand.ogImage) {
      config.admin.meta.openGraph = {
        ...(config.admin.meta.openGraph || {}),
        images: [{ url: brand.ogImage }],
      }
    }

    return config
  }
