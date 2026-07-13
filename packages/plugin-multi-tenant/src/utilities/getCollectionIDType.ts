import type { CollectionSlug, CMS } from '@hanzo/cms'

type Args = {
  collectionSlug: CollectionSlug
  cms: CMS
}
export const getCollectionIDType = ({ collectionSlug, cms }: Args): 'number' | 'text' => {
  return cms.collections[collectionSlug]?.customIDType ?? cms.db.defaultIDType
}
