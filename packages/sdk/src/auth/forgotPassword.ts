import type { AuthCollectionSlug, CMSTypesShape } from '@hanzo/cms'

import type { CMSSDK } from '../index.js'

export type ForgotPasswordOptions<
  T extends CMSTypesShape,
  TSlug extends AuthCollectionSlug<T>,
> = {
  collection: TSlug
  data: {
    disableEmail?: boolean
    email: string
    expiration?: number
  }
}

export async function forgotPassword<
  T extends CMSTypesShape,
  TSlug extends AuthCollectionSlug<T>,
>(
  sdk: CMSSDK<T>,
  options: ForgotPasswordOptions<T, TSlug>,
  init?: RequestInit,
): Promise<{ message: string }> {
  const response = await sdk.request({
    init,
    json: options.data,
    method: 'POST',
    path: `/${options.collection}/forgot-password`,
  })

  return response.json()
}
