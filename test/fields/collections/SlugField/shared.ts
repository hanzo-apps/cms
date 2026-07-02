import type { RequiredDataFromCollection } from '@hanzo/cms'

import type { SlugField } from '../../payload-types.js'

export const defaultText = 'default-text'
export const slugFieldSlug = 'slug-fields'

export const slugFieldDoc: RequiredDataFromCollection<SlugField> = {
  title: 'Seeded text document',
  slug: 'seeded-text-document',
  localizedTitle: 'Localized text',
  localizedSlug: 'localized-text',
  customSlugify: 'SEEDED-TEXT-DOCUMENT',
}
