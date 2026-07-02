import type { RichTextCustomElement } from '../../../types.js'

const name = 'h5'

export const h5: RichTextCustomElement = {
  name,
  Button: {
    clientProps: {
      format: name,
    },
    path: '@hanzo/cms-richtext-slate/client#H5ElementButton',
  },
  Element: '@hanzo/cms-richtext-slate/client#Heading5Element',
}
