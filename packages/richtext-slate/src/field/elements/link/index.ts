import type { RichTextCustomElement } from '../../../types.js'

export const link: RichTextCustomElement = {
  name: 'link',
  Button: '@hanzo/cms-richtext-slate/client#LinkButton',
  Element: '@hanzo/cms-richtext-slate/client#LinkElement',
  plugins: ['@hanzo/cms-richtext-slate/client#WithLinks'],
}
