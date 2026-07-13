import type { FileData, CMSRequest } from '@hanzo/cms'

import type { File } from '../types.js'

interface CloudStorageContext {
  file: CMSRequest['file']
  uploadSizes: CMSRequest['cmsUploadSizes']
}

export function getIncomingFiles({
  data,
  req,
}: {
  data: Partial<FileData>
  req: CMSRequest
}): File[] {
  // Fall back to context if req.file was cleared
  const ctx = req.context?._cmsCloudStorage as CloudStorageContext | undefined
  const file = req.file ?? ctx?.file
  const cmsUploadSizes = req.cmsUploadSizes ?? ctx?.uploadSizes

  let files: File[] = []

  if (file && data.filename && data.mimeType) {
    const mainFile: File = {
      buffer: file.data,
      clientUploadContext: file.clientUploadContext,
      filename: data.filename,
      filesize: file.size,
      mimeType: data.mimeType,
      tempFilePath: file.tempFilePath,
    }

    files = [mainFile]

    if (data?.sizes) {
      Object.entries(data.sizes).forEach(([key, resizedFileData]) => {
        if (cmsUploadSizes?.[key] && resizedFileData.mimeType) {
          files = files.concat([
            {
              buffer: cmsUploadSizes[key],
              filename: `${resizedFileData.filename}`,
              filesize: cmsUploadSizes[key].length,
              mimeType: resizedFileData.mimeType,
            },
          ])
        }
      })
    }
  }

  return files
}
