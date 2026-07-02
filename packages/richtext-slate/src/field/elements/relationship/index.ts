import type { RichTextCustomElement } from '../../../types.js'

import { relationshipName } from './shared.js'

export const relationship: RichTextCustomElement = {
  name: relationshipName,
  Button: '@hanzo/cms-richtext-slate/client#RelationshipButton',
  Element: '@hanzo/cms-richtext-slate/client#RelationshipElement',
  plugins: ['@hanzo/cms-richtext-slate/client#WithRelationship'],
}
