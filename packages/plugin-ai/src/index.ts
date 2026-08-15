import type { Config } from '@hanzo/cms'

import type { HanzoAIPluginConfig } from './types.js'

import { endpoints } from './endpoints.js'

export { HanzoAIFeature } from './features/ai/feature.server.js'
export type {
  HanzoAIPluginConfig,
  ImageRequest,
  ImageResponse,
  WriteAction,
  WriteRequest,
  WriteResponse,
} from './types.js'

/**
 * AI plugin.
 *
 * Mounts two editor endpoints on the framework's existing REST route:
 * `${routes.api}/ai/write` rewrites text, `${routes.api}/ai/image` generates an
 * image and stores it as an upload document.
 *
 * Every gateway call carries the editor's OWN Hanzo IAM bearer and the org they
 * are acting in. That is what makes org attribution, spend limits and metering
 * automatic, so this package holds no key and writes no billing code.
 *
 * Pair it with `HanzoAIFeature` on a lexical editor for the toolbar and slash
 * menu that call these endpoints.
 */
export const hanzoAIPlugin =
  (pluginConfig: HanzoAIPluginConfig = {}) =>
  (incomingConfig: Config): Config => {
    if (pluginConfig.enabled === false) {
      return incomingConfig
    }

    const config = incomingConfig
    config.endpoints = [...(config.endpoints ?? []), ...endpoints(pluginConfig)]

    return config
  }
