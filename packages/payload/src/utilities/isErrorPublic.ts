import { status as httpStatus } from 'http-status'

import type { SanitizedConfig } from '../config/types.js'

type CMSError = {
  isPublic?: boolean
  status?: number
} & Error

/**
 * Determines if an error should be shown to the user.
 */
export function isErrorPublic(error: Error, config: SanitizedConfig) {
  const cmsError = error as CMSError

  if (config.debug) {
    return true
  }
  if (cmsError.isPublic === true) {
    return true
  }
  if (cmsError.isPublic === false) {
    return false
  }
  if (cmsError.status && cmsError.status !== httpStatus.INTERNAL_SERVER_ERROR) {
    return true
  }

  return false
}
