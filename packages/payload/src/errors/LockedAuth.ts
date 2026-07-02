import type { TFunction } from '@hanzo/cms-translations'

import { en } from '@hanzo/cms-translations/languages/en'
import { status as httpStatus } from 'http-status'

import { APIError } from './APIError.js'

export class LockedAuth extends APIError {
  constructor(t?: TFunction) {
    super(t ? t('error:userLocked') : en.translations.error.userLocked, httpStatus.UNAUTHORIZED)
  }
}
