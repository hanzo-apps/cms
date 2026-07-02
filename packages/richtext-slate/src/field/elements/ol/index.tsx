import type { RichTextCustomElement } from '../../../types.js'

const name = 'ol'

export const ol: RichTextCustomElement = {
  name,
  Button: {
    clientProps: {
      format: name,
    },
    path: '@hanzo/cms-richtext-slate/client#OLElementButton',
  },
  Element: '@hanzo/cms-richtext-slate/client#OrderedListElement',
}
