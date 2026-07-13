import type { DefaultServerCellComponentProps } from '@hanzo/cms'

import React from 'react'

import { FolderTableCellClient } from './index.client.js'

export const FolderTableCell = (props: DefaultServerCellComponentProps) => {
  const titleToRender =
    (props.collectionConfig.upload ? props.rowData?.filename : props.rowData?.title) ||
    props.rowData.id

  if (!props.cms.config.folders) {
    return null
  }

  return (
    <FolderTableCellClient
      collectionSlug={props.collectionSlug}
      data={props.rowData}
      docTitle={titleToRender}
      folderCollectionSlug={props.cms.config.folders.slug}
      folderFieldName={props.cms.config.folders.fieldName}
      viewType={props.viewType}
    />
  )
}
