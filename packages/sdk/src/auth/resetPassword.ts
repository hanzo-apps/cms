import type { AuthCollectionSlug, CMSTypesShape } from '@hanzo/cms'

import type { CMSSDK } from '../index.js'
import type { DataFromAuthSlug } from '../types.js'

export type ResetPasswordOptions<
  T extends CMSTypesShape,
  TSlug extends AuthCollectionSlug<T>,
> = {
  collection: TSlug
  data: {
    password: string
    token: string
  }
}

export type ResetPasswordResult<
  T extends CMSTypesShape,
  TSlug extends AuthCollectionSlug<T>,
> = {
  token?: string
  user: DataFromAuthSlug<T, TSlug>
}

export async function resetPassword<
  T extends CMSTypesShape,
  TSlug extends AuthCollectionSlug<T>,
>(
  sdk: CMSSDK<T>,
  options: ResetPasswordOptions<T, TSlug>,
  init?: RequestInit,
): Promise<ResetPasswordResult<T, TSlug>> {
  const response = await sdk.request({
    init,
    json: options.data,
    method: 'POST',
    path: `/${options.collection}/reset-password`,
  })

  return response.json()
}
