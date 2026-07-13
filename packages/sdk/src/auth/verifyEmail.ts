import type { AuthCollectionSlug, CMSTypesShape } from '@hanzo/cms'

import type { CMSSDK } from '../index.js'

export type VerifyEmailOptions<T extends CMSTypesShape, TSlug extends AuthCollectionSlug<T>> = {
  collection: TSlug
  token: string
}

export async function verifyEmail<T extends CMSTypesShape, TSlug extends AuthCollectionSlug<T>>(
  sdk: CMSSDK<T>,
  options: VerifyEmailOptions<T, TSlug>,
  init?: RequestInit,
): Promise<{ message: string }> {
  const response = await sdk.request({
    init,
    method: 'POST',
    path: `/${options.collection}/verify/${options.token}`,
  })

  return response.json()
}
