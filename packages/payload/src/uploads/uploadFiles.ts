import type { CMS } from '../index.js'
import type { CMSRequest } from '../types/index.js'
import type { FileToSave } from './types.js'

import { FileUploadError } from '../errors/index.js'
import { saveBufferToFile } from './saveBufferToFile.js'

export const uploadFiles = async (
  cms: CMS,
  files: FileToSave[],
  req: CMSRequest,
): Promise<void> => {
  try {
    await Promise.all(
      files.map(async ({ buffer, path }) => {
        await saveBufferToFile(buffer, path)
      }),
    )
  } catch (err) {
    cms.logger.error(err)
    throw new FileUploadError(req.t)
  }
}
