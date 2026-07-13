import { jwtVerify } from 'jose'

import type { CMS, Where } from '../../types/index.js'
import type { AuthStrategyFunction, AuthStrategyResult } from '../index.js'

import { extractJWT } from '../extractJWT.js'

type JWTToken = {
  collection: string
  id: string
  sid?: string
}

async function autoLogin({
  isGraphQL,
  cms,
  strategyName = 'local-jwt',
}: {
  isGraphQL: boolean
  cms: CMS
  strategyName?: string
}): Promise<{
  user: AuthStrategyResult['user']
}> {
  if (
    typeof cms?.config?.admin?.autoLogin !== 'object' ||
    cms.config.admin?.autoLogin.prefillOnly ||
    !cms?.config?.admin?.autoLogin ||
    (!cms.config.admin?.autoLogin.email && !cms.config.admin?.autoLogin.username)
  ) {
    return { user: null }
  }

  const collection = cms.collections[cms.config.admin.user]

  const where: Where = {
    or: [],
  }
  if (cms.config.admin?.autoLogin.email) {
    where.or?.push({
      email: {
        equals: cms.config.admin?.autoLogin.email,
      },
    })
  } else if (cms.config.admin?.autoLogin.username) {
    where.or?.push({
      username: {
        equals: cms.config.admin?.autoLogin.username,
      },
    })
  }

  const user = (
    await cms.find({
      collection: collection!.config.slug,
      depth: isGraphQL ? 0 : collection!.config.auth.depth,
      limit: 1,
      pagination: false,
      where,
    })
  ).docs[0] as AuthStrategyResult['user']

  if (!user) {
    return { user: null }
  }
  user.collection = collection!.config.slug
  user._strategy = strategyName

  return {
    user,
  }
}

/**
 * Authentication strategy function for JWT tokens
 */
export const JWTAuthentication: AuthStrategyFunction = async ({
  headers,
  isGraphQL = false,
  cms,
  strategyName = 'local-jwt',
}) => {
  try {
    const token = extractJWT({ headers, cms })

    if (!token) {
      if (headers.get('DisableAutologin') !== 'true') {
        return await autoLogin({ isGraphQL, cms, strategyName })
      }
      return { user: null }
    }

    const secretKey = new TextEncoder().encode(cms.secret)
    const { cms: decodedCMS } = await jwtVerify<JWTToken>(token, secretKey)
    const collection = cms.collections[decodedCMS.collection]

    const user = (await cms.findByID({
      id: decodedCMS.id,
      collection: decodedCMS.collection,
      depth: isGraphQL ? 0 : collection!.config.auth.depth,
    })) as AuthStrategyResult['user']

    if (user && (!collection!.config.auth.verify || user._verified)) {
      if (collection!.config.auth.useSessions) {
        const existingSession = (user.sessions || []).find(({ id }) => id === decodedCMS.sid)

        if (!existingSession || !decodedCMS.sid) {
          return {
            user: null,
          }
        }

        user._sid = decodedCMS.sid
      }

      user.collection = collection!.config.slug
      user._strategy = strategyName
      return {
        user,
      }
    } else {
      if (headers.get('DisableAutologin') !== 'true') {
        return await autoLogin({ isGraphQL, cms, strategyName })
      }
      return { user: null }
    }
  } catch (ignore) {
    if (headers.get('DisableAutologin') !== 'true') {
      return await autoLogin({ isGraphQL, cms, strategyName })
    }
    return { user: null }
  }
}
