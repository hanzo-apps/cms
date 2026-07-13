import type {
  CollectionSlug,
  DefaultDocumentIDType,
  GlobalSlug,
  CMSRequest,
  Where,
} from '../../../index.js'

/**
 * This is a cross-entity way to count the number of versions for any given document.
 * It will work for both collections and globals.
 * @returns number of versions
 */
export const countVersions = async (args: {
  collectionSlug?: CollectionSlug
  globalSlug?: GlobalSlug
  parentID?: DefaultDocumentIDType
  req: CMSRequest
}): Promise<number> => {
  const { collectionSlug, globalSlug, parentID, req } = args

  let countFn

  const where: Where = {
    parent: {
      equals: parentID,
    },
  }

  if (collectionSlug) {
    countFn = () =>
      req.cms.countVersions({
        collection: collectionSlug,
        where,
      })
  }

  if (globalSlug) {
    countFn = () =>
      req.cms.countGlobalVersions({
        global: globalSlug,
        where,
      })
  }

  const res = countFn ? (await countFn()?.then((res) => res.totalDocs || 0)) || 0 : 0

  return res
}
