import type { CollectionBeforeChangeHook, FileData, TypeWithID } from '@hanzo/cms'

/**
 * Preserves req.file in req.context and ensures nested calls don't overwrite the original file data.
 */
export const getPreserveFileDataHook =
  (): CollectionBeforeChangeHook<FileData & TypeWithID> =>
  ({ req }) => {
    if (req.file && !req.context?._cmsCloudStorage) {
      req.context = req.context || {}
      req.context._cmsCloudStorage = {
        file: req.file,
        uploadSizes: req.cmsUploadSizes,
      }
    }
  }
