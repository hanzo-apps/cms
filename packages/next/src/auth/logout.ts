'use server'

import type { MaybePromise, SanitizedConfig } from '@hanzo/cms'

import { cookies as getCookies, headers as nextHeaders } from 'next/headers.js'
import { createLocalReq, getCMS, logoutOperation } from '@hanzo/cms'

import { getExistingAuthToken } from '../utilities/getExistingAuthToken.js'

export async function logout({
  allSessions = false,
  config,
}: {
  allSessions?: boolean
  config: MaybePromise<SanitizedConfig>
}) {
  const cms = await getCMS({ config, cron: true })
  const headers = await nextHeaders()
  const authResult = await cms.auth({ headers })

  if (!authResult.user) {
    return { message: 'User already logged out', success: true }
  }

  const { user } = authResult
  const req = await createLocalReq({ user }, cms)
  const collection = cms.collections[user.collection]

  const logoutResult = await logoutOperation({
    allSessions,
    collection,
    req,
  })

  if (!logoutResult) {
    return { message: 'Logout failed', success: false }
  }

  const existingCookie = await getExistingAuthToken(cms.config.cookiePrefix)
  if (existingCookie) {
    const cookies = await getCookies()
    cookies.delete(existingCookie.name)
  }

  return { message: 'User logged out successfully', success: true }
}
