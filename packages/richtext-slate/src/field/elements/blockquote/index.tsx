import type { RichTextCustomElement } from '../../../types.js'

const name = 'blockquote'

export const blockquote: RichTextCustomElement = {
  name,
  Button: {
    clientProps: {
      format: name,
    },
    path: '@hanzo/cms-richtext-slate/client#BlockquoteElementButton',
  },
  Element: '@hanzo/cms-richtext-slate/client#BlockquoteElement',
}
