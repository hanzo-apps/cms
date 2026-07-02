import type { RichTextCustomElement } from '../../../types.js'

const name = 'h2'

export const h2: RichTextCustomElement = {
  name,
  Button: {
    clientProps: {
      format: name,
    },
    path: '@hanzo/cms-richtext-slate/client#H2ElementButton',
  },
  Element: '@hanzo/cms-richtext-slate/client#Heading2Element',
}
