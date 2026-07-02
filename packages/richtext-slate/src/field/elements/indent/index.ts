import type { RichTextCustomElement } from '../../../types.js'

import { indentType } from './shared.js'

export const indent: RichTextCustomElement = {
  name: indentType,
  Button: '@hanzo/cms-richtext-slate/client#IndentButton',
  Element: '@hanzo/cms-richtext-slate/client#IndentElement',
}
