import type { Locale, CMSRequest } from '@hanzo/cms'

import { upsertPreferences } from '@hanzo/cms-ui/rsc'
import { findLocaleFromCode } from '@hanzo/cms-ui/shared'

import { getPreferences } from './getPreferences.js'

type GetRequestLocalesArgs = {
  req: CMSRequest
}

export async function getRequestLocale({ req }: GetRequestLocalesArgs): Promise<Locale> {
  if (req.cms.config.localization) {
    const localeFromParams = req.query.locale as string | undefined

    if (req.user && localeFromParams) {
      await upsertPreferences<Locale['code']>({ key: 'locale', req, value: localeFromParams })
    }

    return (
      (req.user &&
        findLocaleFromCode(
          req.cms.config.localization,
          localeFromParams ||
            (
              await getPreferences<Locale['code']>(
                'locale',
                req.cms,
                req.user.id,
                req.user.collection,
              )
            )?.value,
        )) ||
      findLocaleFromCode(
        req.cms.config.localization,
        req.cms.config.localization.defaultLocale || 'en',
      )
    )
  }

  return undefined
}
