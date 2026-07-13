'use server'

import type { AuthCollectionSlug, LoginResult, MaybePromise, SanitizedConfig } from '@hanzo/cms'

import { getCMS } from '@hanzo/cms'

import { setCMSAuthCookie } from '../utilities/setPayloadAuthCookie.js'

type LoginWithEmail<TSlug extends AuthCollectionSlug> = {
  collection: TSlug
  config: MaybePromise<SanitizedConfig>
  email: string
  password: string
  username?: never
}

type LoginWithUsername<TSlug extends AuthCollectionSlug> = {
  collection: TSlug
  config: MaybePromise<SanitizedConfig>
  email?: never
  password: string
  username: string
}
type LoginArgs<TSlug extends AuthCollectionSlug> = LoginWithEmail<TSlug> | LoginWithUsername<TSlug>

export async function login<TSlug extends AuthCollectionSlug>({
  collection,
  config,
  email,
  password,
  username,
}: LoginArgs<TSlug>): Promise<LoginResult<TSlug>> {
  const cms = await getCMS({ config, cron: true })

  const authConfig = cms.collections[collection]?.config.auth

  if (!authConfig) {
    throw new Error(`No auth config found for collection: ${collection}`)
  }

  const loginWithUsername = authConfig?.loginWithUsername ?? false

  if (loginWithUsername) {
    if (loginWithUsername.allowEmailLogin) {
      if (!email && !username) {
        throw new Error('Email or username is required.')
      }
    } else {
      if (!username) {
        throw new Error('Username is required.')
      }
    }
  } else {
    if (!email) {
      throw new Error('Email is required.')
    }
  }

  let loginData

  if (loginWithUsername) {
    loginData = username ? { password, username } : { email, password }
  } else {
    loginData = { email, password }
  }

  const result = await cms.login({
    collection,
    data: loginData,
  })

  if (result.token) {
    await setCMSAuthCookie({
      authConfig,
      cookiePrefix: cms.config.cookiePrefix,
      token: result.token,
    })
  }

  if ('removeTokenFromResponses' in config && config.removeTokenFromResponses) {
    delete result.token
  }

  return result
}
