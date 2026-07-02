import type { CollectionSlug, GlobalSlug } from '@hanzo/cms'

export const collectionSlugs: {
  [key: string]: CollectionSlug
} = {
  validateDraftsOff: 'validate-drafts-off',
  validateDraftsOn: 'validate-drafts-on',
  validateDraftsOnAutosave: 'validate-drafts-on-autosave',
  prevValue: 'prev-value',
  prevValueRelation: 'prev-value-relation',
  errorFields: 'error-fields',
}

export const globalSlugs: {
  [key: string]: GlobalSlug
} = {
  globalValidateDraftsOn: 'global-validate-drafts-on',
}
