import type { CollectionSlug, CMSTypesShape, TypedLocale, Where } from '@hanzo/cms'

import type { CMSSDK } from '../index.js'

export type CountOptions<T extends CMSTypesShape, TSlug extends CollectionSlug<T>> = {
  /**
   * the Collection slug to operate against.
   */
  collection: TSlug
  /**
   *  Specify [locale](https://payloadcms.com/docs/configuration/localization) for any returned documents.
   */
  locale?: 'all' | TypedLocale<T>
  /**
   * When `true`, the count includes trashed documents (same semantics as `find`). No effect unless the collection has `trash` enabled.
   * @default false
   */
  trash?: boolean
  /**
   * A filter [query](https://payloadcms.com/docs/queries/overview)
   */
  where?: Where
}

export async function count<T extends CMSTypesShape, TSlug extends CollectionSlug<T>>(
  sdk: CMSSDK<T>,
  options: CountOptions<T, TSlug>,
  init?: RequestInit,
): Promise<{ totalDocs: number }> {
  const response = await sdk.request({
    args: options,
    init,
    method: 'GET',
    path: `/${options.collection}/count`,
  })

  return response.json()
}
