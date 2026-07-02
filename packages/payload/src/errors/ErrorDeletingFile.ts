import type { TFunction } from '@hanzo/cms-translations'

import { en } from '@hanzo/cms-translations/languages/en'
import { status as httpStatus } from 'http-status'

import { APIError } from './APIError.js'

export class ErrorDeletingFile extends APIError {
  constructor(t?: TFunction) {
    super(
      t ? t('error:deletingFile') : en.translations.error.deletingFile,
      httpStatus.INTERNAL_SERVER_ERROR,
    )
  }
}
