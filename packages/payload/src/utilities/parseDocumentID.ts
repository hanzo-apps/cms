import type { CollectionSlug, CMS } from '../index.js'

import { isNumber } from './isNumber.js'

type ParseDocumentIDArgs = {
  collectionSlug: CollectionSlug
  id?: number | string
  cms: CMS
}

export function parseDocumentID({ id, collectionSlug, cms }: ParseDocumentIDArgs) {
  const idType = cms.collections[collectionSlug]?.customIDType ?? cms.db.defaultIDType

  return id ? (idType === 'number' && isNumber(id) ? parseFloat(String(id)) : id) : undefined
}
