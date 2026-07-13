import type { InitOptions, CMS } from '@hanzo/cms'

import { getCMS } from '@hanzo/cms'

/**
 *  getCMSHMR is no longer preferred.
 *  You can now use in all contexts:
 *  ```ts
 *   import { getCMS } from '@hanzo/cms'
 *  ```
 * @deprecated
 */
export const getCMSHMR = async (
  options: Pick<InitOptions, 'config' | 'importMap'>,
): Promise<CMS> => {
  const result = await getCMS(options)

  result.logger.warn(
    "Deprecation warning: getCMSHMR is no longer preferred. You can now use `import { getCMS } from '@hanzo/cms' in all contexts.",
  )

  return result
}
