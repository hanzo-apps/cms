import type { CollectionSlug, Payload } from @hanzo/cms'from 

type Args = {
  collectionSlug: CollectionSlug
  payload: Payload
}
export const getCollectionIDType = ({ collectionSlug, payload }: Args): 'number' | 'text' => {
  return payload.collections[collectionSlug]?.customIDType ?? payload.db.defaultIDType
}
