import { createLocalReq, type CMS, type CMSRequest, type TypedLocale } from '@hanzo/cms'

import type { HTMLPopulateFn } from '../lexicalToHtml/async/types.js'

import { populate } from '../../../populateGraphQL/populate.js'

export const getCMSPopulateFn: (
  args: {
    currentDepth: number
    depth: number
    draft?: boolean
    locale?: TypedLocale

    overrideAccess?: boolean
    showHiddenFields?: boolean
  } & (
    | {
        /**
         * This cms property will only be used if req is undefined. If localization is enabled, you must pass `req` instead.
         */
        cms: CMS
        /**
         * When the converter is called, req CAN be passed in depending on where it's run.
         * If this is undefined and config is passed through, lexical will create a new req object for you.
         */
        req?: never
      }
    | {
        /**
         * This cms property will only be used if req is undefined. If localization is enabled, you must pass `req` instead.
         */
        cms?: never
        /**
         * When the converter is called, req CAN be passed in depending on where it's run.
         * If this is undefined and config is passed through, lexical will create a new req object for you.
         */
        req: CMSRequest
      }
  ),
) => Promise<HTMLPopulateFn> = async ({
  currentDepth,
  depth,
  draft,
  overrideAccess,
  cms,
  req,
  showHiddenFields,
}) => {
  let reqToUse: CMSRequest | undefined = req
  if (req === undefined && cms) {
    reqToUse = await createLocalReq({}, cms)
  }

  if (!reqToUse) {
    throw new Error('No req or cms provided')
  }

  const populateFn: HTMLPopulateFn = async ({ id, collectionSlug, select }) => {
    const dataContainer: {
      value?: any
    } = {}

    await populate({
      id,
      collectionSlug,
      currentDepth,
      data: dataContainer,
      depth,
      draft: draft ?? false,
      key: 'value',
      overrideAccess: overrideAccess ?? true,
      req: reqToUse,
      select,
      showHiddenFields: showHiddenFields ?? false,
    })

    return dataContainer.value
  }

  return populateFn
}
