import type { I18n } from '@hanzo/cms-translations'
import type {
  PaginatedDocs,
  SanitizedCollectionConfig,
  SanitizedConfig,
  SanitizedGlobalConfig,
  TypedUser,
} from '@hanzo/cms'

export type DefaultVersionsViewProps = {
  canAccessAdmin: boolean
  collectionConfig?: SanitizedCollectionConfig
  config: SanitizedConfig
  data: Document
  editURL: string
  entityLabel: string
  globalConfig?: SanitizedGlobalConfig
  i18n: I18n
  id: number | string
  limit: number
  user: TypedUser
  versionsData: PaginatedDocs<Document>
}
