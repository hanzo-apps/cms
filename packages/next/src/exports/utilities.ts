// NOTICE: Server-only utilities, do not import anything client-side here.

export { getNextRequestI18n } from '../utilities/getNextRequestI18n.js'
export { getCMSHMR } from '../utilities/getPayloadHMR.js'

import {
  addDataAndFileToRequest as _addDataAndFileToRequest,
  addLocalesToRequestFromData as _addLocalesToRequestFromData,
  createCMSRequest as _createCMSRequest,
  headersWithCors as _headersWithCors,
  mergeHeaders as _mergeHeaders,
  sanitizeLocales as _sanitizeLocales,
} from '@hanzo/cms'

/**
 * Use:
 * ```ts
 * import { mergeHeaders } from '@hanzo/cms'
 * ```
 * @deprecated
 */
export const mergeHeaders = _mergeHeaders

/**
 * @deprecated
 * Use:
 * ```ts
 * import { headersWithCors } from '@hanzo/cms'
 * ```
 */
export const headersWithCors = _headersWithCors

/**
 * @deprecated
 * Use:
 * ```ts
 * import { createCMSRequest } from '@hanzo/cms'
 * ```
 */
export const createCMSRequest = _createCMSRequest

/**
 * @deprecated
 * Use:
 * ```ts
 * import { addDataAndFileToRequest } from '@hanzo/cms'
 * ```
 */
export const addDataAndFileToRequest = _addDataAndFileToRequest

/**
 * @deprecated
 * Use:
 * ```ts
 * import { sanitizeLocales } from '@hanzo/cms'
 * ```
 */
export const sanitizeLocales = _sanitizeLocales

/**
 * @deprecated
 * Use:
 * ```ts
 * import { addLocalesToRequestFromData } from '@hanzo/cms'
 * ```
 */
export const addLocalesToRequestFromData = _addLocalesToRequestFromData
