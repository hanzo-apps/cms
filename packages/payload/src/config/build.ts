import type { Config, SanitizedConfig } from './types.js'

import { sanitizeConfig } from './sanitize.js'

/**
 * @description Builds and validates CMS configuration
 * @param config CMS Config
 * @returns Built and sanitized CMS Config
 */
export async function buildConfig(config: Config): Promise<SanitizedConfig> {
  if (Array.isArray(config.plugins)) {
    const sorted = [...config.plugins].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    for (const plugin of sorted) {
      config = await plugin(config)
    }
  }

  return await sanitizeConfig(config)
}
