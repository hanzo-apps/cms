import type { RelationshipFieldServerProps } from '@hanzo/cms'

// eslint-disable-next-line payload/no-imports-from-exports-dir
import { MoveDocToFolder } from '../../../exports/client/index.js'
import './index.scss'

const baseClass = 'folder-edit-field'

export const FolderField = (props: RelationshipFieldServerProps) => {
  if (props.cms.config.folders === false) {
    return null
  }
  return (
    <MoveDocToFolder
      className={baseClass}
      folderCollectionSlug={props.cms.config.folders.slug}
      folderFieldName={props.cms.config.folders.fieldName}
    />
  )
}
