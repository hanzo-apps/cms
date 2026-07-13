import type { AuthCollectionSlug, CMSTypesShape } from '@hanzo/cms'

import type { CMSSDK } from '../index.js'
import type { DataFromAuthSlug } from '../types.js'

export type RefreshOptions<T extends CMSTypesShape, TSlug extends AuthCollectionSlug<T>> = {
  collection: TSlug
}

export type RefreshResult<T extends CMSTypesShape, TSlug extends AuthCollectionSlug<T>> = {
  exp: number
  refreshedToken: string
  setCookie?: boolean
  strategy?: string
  user: DataFromAuthSlug<T, TSlug>
}

export async function refreshToken<
  T extends CMSTypesShape,
  TSlug extends AuthCollectionSlug<T>,
>(
  sdk: CMSSDK<T>,
  options: RefreshOptions<T, TSlug>,
  init?: RequestInit,
): Promise<RefreshResult<T, TSlug>> {
  const response = await sdk.request({
    init,
    method: 'POST',
    path: `/${options.collection}/refresh-token`,
  })

  return response.json()
}
