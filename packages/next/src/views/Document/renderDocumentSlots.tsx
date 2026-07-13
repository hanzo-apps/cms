import type {
  BeforeDocumentControlsServerPropsOnly,
  DocumentSlots,
  EditMenuItemsServerPropsOnly,
  Locale,
  CMSRequest,
  PreviewButtonServerPropsOnly,
  PublishButtonServerPropsOnly,
  SanitizedCollectionConfig,
  SanitizedGlobalConfig,
  SanitizedPermissions,
  SaveButtonServerPropsOnly,
  SaveDraftButtonServerPropsOnly,
  ServerFunction,
  ServerProps,
  StaticDescription,
  UnpublishButtonServerPropsOnly,
  ViewDescriptionClientProps,
  ViewDescriptionServerPropsOnly,
} from '@hanzo/cms'

import { ViewDescription } from '@hanzo/cms-ui'
import { RenderServerComponent } from '@hanzo/cms-ui/elements/RenderServerComponent'
import { hasDraftsEnabled } from '@hanzo/cms/shared'

import { getDocumentPermissions } from './getDocumentPermissions.js'

export const renderDocumentSlots: (args: {
  collectionConfig?: SanitizedCollectionConfig
  globalConfig?: SanitizedGlobalConfig
  hasSavePermission: boolean
  id?: number | string
  locale: Locale
  permissions: SanitizedPermissions
  req: CMSRequest
}) => DocumentSlots = (args) => {
  const { id, collectionConfig, globalConfig, hasSavePermission, locale, permissions, req } = args

  const components: DocumentSlots = {} as DocumentSlots

  const unsavedDraftWithValidations = undefined

  const isPreviewEnabled = collectionConfig?.admin?.preview || globalConfig?.admin?.preview

  const serverProps: ServerProps = {
    id,
    i18n: req.i18n,
    locale,
    cms: req.cms,
    permissions,
    user: req.user,
    // TODO: Add remaining serverProps
  }

  const BeforeDocumentControls =
    collectionConfig?.admin?.components?.edit?.beforeDocumentControls ||
    globalConfig?.admin?.components?.elements?.beforeDocumentControls

  if (BeforeDocumentControls) {
    components.BeforeDocumentControls = RenderServerComponent({
      Component: BeforeDocumentControls,
      importMap: req.cms.importMap,
      serverProps: serverProps satisfies BeforeDocumentControlsServerPropsOnly,
    })
  }

  const EditMenuItems = collectionConfig?.admin?.components?.edit?.editMenuItems

  if (EditMenuItems) {
    components.EditMenuItems = RenderServerComponent({
      Component: EditMenuItems,
      importMap: req.cms.importMap,
      serverProps: serverProps satisfies EditMenuItemsServerPropsOnly,
    })
  }

  const CustomPreviewButton =
    collectionConfig?.admin?.components?.edit?.PreviewButton ||
    globalConfig?.admin?.components?.elements?.PreviewButton

  if (isPreviewEnabled && CustomPreviewButton) {
    components.PreviewButton = RenderServerComponent({
      Component: CustomPreviewButton,
      importMap: req.cms.importMap,
      serverProps: serverProps satisfies PreviewButtonServerPropsOnly,
    })
  }

  const LivePreview =
    collectionConfig?.admin?.components?.views?.edit?.livePreview ||
    globalConfig?.admin?.components?.views?.edit?.livePreview

  if (LivePreview?.Component) {
    components.LivePreview = RenderServerComponent({
      Component: LivePreview.Component,
      importMap: req.cms.importMap,
      serverProps,
    })
  }

  const descriptionFromConfig =
    collectionConfig?.admin?.description || globalConfig?.admin?.description

  const staticDescription: StaticDescription =
    typeof descriptionFromConfig === 'function'
      ? descriptionFromConfig({ t: req.i18n.t })
      : descriptionFromConfig

  const CustomDescription =
    collectionConfig?.admin?.components?.Description ||
    globalConfig?.admin?.components?.elements?.Description

  const hasDescription = CustomDescription || staticDescription

  if (hasDescription) {
    components.Description = RenderServerComponent({
      clientProps: {
        collectionSlug: collectionConfig?.slug,
        description: staticDescription,
      } satisfies ViewDescriptionClientProps,
      Component: CustomDescription,
      Fallback: ViewDescription,
      importMap: req.cms.importMap,
      serverProps: serverProps satisfies ViewDescriptionServerPropsOnly,
    })
  }

  if (collectionConfig?.versions?.drafts || globalConfig?.versions?.drafts) {
    const CustomStatus =
      collectionConfig?.admin?.components?.edit?.Status ||
      globalConfig?.admin?.components?.elements?.Status

    if (CustomStatus) {
      components.Status = RenderServerComponent({
        Component: CustomStatus,
        importMap: req.cms.importMap,
        serverProps,
      })
    }
  }

  if (hasSavePermission) {
    if (hasDraftsEnabled(collectionConfig || globalConfig)) {
      const CustomPublishButton =
        collectionConfig?.admin?.components?.edit?.PublishButton ||
        globalConfig?.admin?.components?.elements?.PublishButton

      if (CustomPublishButton) {
        components.PublishButton = RenderServerComponent({
          Component: CustomPublishButton,
          importMap: req.cms.importMap,
          serverProps: serverProps satisfies PublishButtonServerPropsOnly,
        })
      }

      const CustomUnpublishButton =
        collectionConfig?.admin?.components?.edit?.UnpublishButton ||
        globalConfig?.admin?.components?.elements?.UnpublishButton

      if (CustomUnpublishButton) {
        components.UnpublishButton = RenderServerComponent({
          Component: CustomUnpublishButton,
          importMap: req.cms.importMap,
          serverProps: serverProps satisfies UnpublishButtonServerPropsOnly,
        })
      }

      const CustomSaveDraftButton =
        collectionConfig?.admin?.components?.edit?.SaveDraftButton ||
        globalConfig?.admin?.components?.elements?.SaveDraftButton

      const draftsEnabled = hasDraftsEnabled(collectionConfig || globalConfig)

      if ((draftsEnabled || unsavedDraftWithValidations) && CustomSaveDraftButton) {
        components.SaveDraftButton = RenderServerComponent({
          Component: CustomSaveDraftButton,
          importMap: req.cms.importMap,
          serverProps: serverProps satisfies SaveDraftButtonServerPropsOnly,
        })
      }
    } else {
      const CustomSaveButton =
        collectionConfig?.admin?.components?.edit?.SaveButton ||
        globalConfig?.admin?.components?.elements?.SaveButton

      if (CustomSaveButton) {
        components.SaveButton = RenderServerComponent({
          Component: CustomSaveButton,
          importMap: req.cms.importMap,
          serverProps: serverProps satisfies SaveButtonServerPropsOnly,
        })
      }
    }
  }

  if (collectionConfig?.upload && collectionConfig?.admin?.components?.edit?.Upload) {
    components.Upload = RenderServerComponent({
      Component: collectionConfig.admin.components.edit.Upload,
      importMap: req.cms.importMap,
      serverProps,
    })
  }

  if (collectionConfig?.upload && collectionConfig.upload.admin?.components?.controls) {
    components.UploadControls = RenderServerComponent({
      Component: collectionConfig.upload.admin.components.controls,
      importMap: req.cms.importMap,
      serverProps,
    })
  }

  return components
}

export const renderDocumentSlotsHandler: ServerFunction<{
  collectionSlug: string
  id?: number | string
}> = async (args) => {
  const { id, collectionSlug, locale, permissions, req } = args

  const collectionConfig = req.cms.collections[collectionSlug]?.config

  if (!collectionConfig) {
    throw new Error(req.t('error:incorrectCollection'))
  }

  const { hasSavePermission } = await getDocumentPermissions({
    id,
    collectionConfig,
    data: {},
    req,
  })

  return renderDocumentSlots({
    id,
    collectionConfig,
    hasSavePermission,
    locale,
    permissions,
    req,
  })
}
