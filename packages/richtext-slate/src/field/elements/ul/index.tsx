import type { RichTextCustomElement } from '../../../types.js'

const name = 'ul'

export const ul: RichTextCustomElement = {
  name,
  Button: {
    clientProps: {
      format: name,
    },
    path: '@hanzo/cms-richtext-slate/client#ULElementButton',
  },
  Element: '@hanzo/cms-richtext-slate/client#UnorderedListElement',
}
