import type { CustomComponent, CMSServerReactComponent } from '@hanzo/cms'

import type { CollectionLabels, ResolvedCollectionLabels } from '../../../types.js'

export type ReindexButtonProps = {
  collectionLabels: ResolvedCollectionLabels
  searchCollections: string[]
  searchSlug: string
}

export type ReindexButtonServerProps = {
  collectionLabels: CollectionLabels
} & Omit<ReindexButtonProps, 'collectionLabels'>

export type SearchReindexButtonClientComponent = ReindexButtonProps

export type SearchReindexButtonServerComponent = CMSServerReactComponent<
  CustomComponent<ReindexButtonServerProps>
>
