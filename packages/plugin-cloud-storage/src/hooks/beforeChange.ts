import type { CollectionConfig, FieldHook, ImageSize } from '@hanzo/cms'

import type { GeneratedAdapter, GenerateFileURL } from '../types.js'

interface Args {
  adapter: GeneratedAdapter
  collection: CollectionConfig
  disableCMSAccessControl?: boolean
  generateFileURL?: GenerateFileURL
  size?: ImageSize
}

export const getBeforeChangeHook =
  ({ adapter, collection, disableCMSAccessControl, generateFileURL, size }: Args): FieldHook =>
  async ({ data, originalDoc, value }) => {
    const newFilename = size ? data?.sizes?.[size.name]?.filename : data?.filename
    const originalFilename = size
      ? originalDoc?.sizes?.[size.name]?.filename
      : originalDoc?.filename
    const filename = newFilename || originalFilename
    const prefix = data?.prefix
    let url = value

    if (generateFileURL && filename) {
      url = await generateFileURL({
        collection,
        filename,
        prefix,
        size,
      })
    } else if (disableCMSAccessControl && filename && adapter.generateURL) {
      url = await adapter.generateURL({
        collection,
        data: data || originalDoc,
        filename,
        prefix,
      })
    }

    return url
  }
