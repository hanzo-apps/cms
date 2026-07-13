'use server'

import type { CollectionSlug, MaybePromise, SanitizedConfig } from '@hanzo/cms'

import { headers as nextHeaders } from 'next/headers.js'
import { createLocalReq, getCMS, refreshOperation } from '@hanzo/cms'

import { getExistingAuthToken } from '../utilities/getExistingAuthToken.js'
import { setCMSAuthCookie } from '../utilities/setPayloadAuthCookie.js'

export async function refresh({ config }: { config: MaybePromise<SanitizedConfig> }) {
  const cms = await getCMS({ config, cron: true })
  const headers = await nextHeaders()
  const result = await cms.auth({ headers })

  if (!result.user) {
    throw new Error('Cannot refresh token: user not authenticated')
  }

  const existingCookie = await getExistingAuthToken(cms.config.cookiePrefix)
  if (!existingCookie) {
    return { message: 'No valid token found to refresh', success: false }
  }

  const collection: CollectionSlug | undefined = result.user.collection
  const collectionConfig = cms.collections[collection]

  if (!collectionConfig?.config.auth) {
    throw new Error(`No auth config found for collection: ${collection}`)
  }

  const req = await createLocalReq({ user: result.user }, cms)

  const refreshResult = await refreshOperation({
    collection: collectionConfig,
    req,
  })

  if (!refreshResult) {
    return { message: 'Token refresh failed', success: false }
  }

  await setCMSAuthCookie({
    authConfig: collectionConfig.config.auth,
    cookiePrefix: cms.config.cookiePrefix,
    token: refreshResult.refreshedToken,
  })

  return { message: 'Token refreshed successfully', success: true }
}
