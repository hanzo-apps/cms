import type { RichTextCustomElement } from '../../../types.js'

import { uploadName } from './shared.js'

export const upload: RichTextCustomElement = {
  name: uploadName,
  Button: '@hanzo/cms-richtext-slate/client#UploadElementButton',
  Element: '@hanzo/cms-richtext-slate/client#UploadElement',
  plugins: ['@hanzo/cms-richtext-slate/client#WithUpload'],
}
