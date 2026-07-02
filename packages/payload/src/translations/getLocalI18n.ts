import type { AcceptedLanguages } from '@hanzo/cms-translations'

import { initI18n } from '@hanzo/cms-translations'

import type { SanitizedConfig } from '../config/types.js'

export const getLocalI18n = async ({
  config,
  language,
}: {
  config: SanitizedConfig
  language: AcceptedLanguages
}) =>
  initI18n({
    config: config.i18n,
    context: 'api',
    language,
  })
