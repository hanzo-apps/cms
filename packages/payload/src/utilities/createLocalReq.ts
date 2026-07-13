import type { CMS, RequestContext, TypedLocale, TypedUser } from '../index.js'
import type { CMSRequest } from '../types/index.js'

import { getDataLoader } from '../collections/dataloader.js'
import { getLocalI18n } from '../translations/getLocalI18n.js'
import { sanitizeFallbackLocale } from '../utilities/sanitizeFallbackLocale.js'

function getRequestContext(
  req: Partial<CMSRequest> = { context: null } as unknown as CMSRequest,
  context: RequestContext = {},
): RequestContext {
  if (req.context) {
    if (Object.keys(req.context).length === 0 && req.context.constructor === Object) {
      // if req.context is `{}` avoid unnecessary spread
      return context
    } else {
      return { ...req.context, ...context }
    }
  } else {
    return context
  }
}

const attachFakeURLProperties = (req: Partial<CMSRequest>, urlSuffix?: string) => {
  /**
   * *NOTE*
   * If no URL is provided, the local API was called outside
   * the context of a request. Therefore we create a fake URL object.
   * `ts-expect-error` is used below for properties that are 'read-only'.
   * Since they do not exist yet we can safely ignore the error.
   */
  let urlObject: undefined | URL

  function getURLObject() {
    if (urlObject) {
      return urlObject
    }

    const fallbackURL = `http://${req.host || 'localhost'}${urlSuffix || ''}`

    const urlToUse =
      req?.url ||
      (req.cms?.config?.serverURL
        ? `${req.cms?.config.serverURL}${urlSuffix || ''}`
        : fallbackURL)

    try {
      urlObject = new URL(urlToUse)
    } catch (_err) {
      req.cms?.logger.error(
        `Failed to create URL object from URL: ${urlToUse}, falling back to ${fallbackURL}`,
      )

      urlObject = new URL(fallbackURL)
    }

    return urlObject
  }

  if (!req.host) {
    req.host = getURLObject().host
  }

  if (!req.protocol) {
    req.protocol = getURLObject().protocol
  }

  if (!req.pathname) {
    req.pathname = getURLObject().pathname
  }

  if (!req.searchParams) {
    // @ts-expect-error eslint-disable-next-line no-param-reassign
    req.searchParams = getURLObject().searchParams
  }

  if (!req.origin) {
    // @ts-expect-error eslint-disable-next-line no-param-reassign
    req.origin = getURLObject().origin
  }

  if (!req?.url) {
    // @ts-expect-error eslint-disable-next-line no-param-reassign
    req.url = getURLObject().href
  }
}

export type CreateLocalReqOptions = {
  context?: RequestContext
  depth?: number
  fallbackLocale?: false | TypedLocale
  locale?: string
  req?: Partial<CMSRequest>
  urlSuffix?: string
  user?: TypedUser
}

type CreateLocalReq = (options: CreateLocalReqOptions, cms: CMS) => Promise<CMSRequest>

export const createLocalReq: CreateLocalReq = async (
  {
    context,
    depth,
    fallbackLocale,
    locale: localeArg,
    req = {} as CMSRequest,
    urlSuffix,
    user,
  },
  cms,
): Promise<CMSRequest> => {
  const localization = cms.config?.localization

  if (localization) {
    const locale = localeArg === '*' ? 'all' : localeArg
    const defaultLocale = localization.defaultLocale
    const localeCandidate = locale || req?.locale || req?.query?.locale

    req.locale =
      localeCandidate && typeof localeCandidate === 'string' ? localeCandidate : defaultLocale

    const sanitizedFallback = sanitizeFallbackLocale({
      fallbackLocale: fallbackLocale!,
      locale: req.locale,
      localization,
    })

    req.fallbackLocale = sanitizedFallback!
  }

  const i18n =
    req?.i18n ||
    (await getLocalI18n({ config: cms.config, language: cms.config.i18n.fallbackLanguage }))

  if (!req.headers) {
    req.headers = new Headers()
  }

  req.context = getRequestContext(req, context)
  req.cmsAPI = req?.cmsAPI || 'local'
  req.cms = cms
  req.i18n = i18n
  req.t = i18n.t
  req.user = user || req?.user || null

  // Ensure user.collection is set for auth-related access control
  // TODO (4.0): Instead of silently falling back, throw an error if user.collection is missing
  if (req.user && !req.user.collection) {
    req.user = { ...req.user, collection: cms.config.admin.user }
  }

  req.cmsDataLoader = req?.cmsDataLoader || getDataLoader(req as CMSRequest)
  req.routeParams = req?.routeParams || {}
  req.query = req?.query || {}

  if (typeof depth !== 'undefined') {
    req.query.depth = depth
  }

  attachFakeURLProperties(req, urlSuffix)

  return req as CMSRequest
}
