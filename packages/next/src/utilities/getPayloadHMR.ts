import type { InitOptions, Payload } from '@hanzo/cms'

import { getPayload } from '@hanzo/cms'

/**
 *  getPayloadHMR is no longer preferred.
 *  You can now use in all contexts:
 *  ```ts
 *   import { getPayload } from '@hanzo/cms'
 *  ```
 * @deprecated
 */
export const getPayloadHMR = async (
  options: Pick<InitOptions, 'config' | 'importMap'>,
): Promise<Payload> => {
  const result = await getPayload(options)

  result.logger.warn(
    "Deprecation warning: getPayloadHMR is no longer preferred. You can now use `import { getPayload } from '@hanzo/cms' in all contexts.",
  )

  return result
}
