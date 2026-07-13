import type { CMSComponent } from '../../../config/types.js'
import type { ImportMap } from '../index.js'

import { parseCMSComponent } from './parsePayloadComponent.js'

export const getFromImportMap = <TOutput>(args: {
  importMap: ImportMap
  CMSComponent: CMSComponent
  schemaPath?: string
  silent?: boolean
}): TOutput => {
  const { importMap, CMSComponent, schemaPath, silent } = args

  const { exportName, path } = parseCMSComponent(CMSComponent)

  const key = path + '#' + exportName

  const importMapEntry = importMap[key]

  if (!importMapEntry && !silent) {
    // eslint-disable-next-line no-console
    console.error(
      `getFromImportMap: CMSComponent not found in importMap`,
      {
        key,
        CMSComponent,
        schemaPath,
      },
      'You may need to run the `cms generate:importmap` command to generate the importMap ahead of runtime.',
    )
  }

  return importMapEntry
}
