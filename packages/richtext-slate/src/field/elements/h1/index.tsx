import type { RichTextCustomElement } from '../../../types.js'

const name = 'h1'

export const h1: RichTextCustomElement = {
  name,
  Button: {
    clientProps: {
      format: name,
    },
    path: '@hanzo/cms-richtext-slate/client#H1ElementButton',
  },
  Element: '@hanzo/cms-richtext-slate/client#Heading1Element',
}
