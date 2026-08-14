import type { Field } from '@hanzo/cms'

export { hanzoIAMStrategy } from './strategy.js'
export { isSuperAdmin } from './super.js'
export type { HanzoIAMStrategyConfig, IAMClaims } from './types.js'

/**
 * Fields the IAM strategy needs on the auth collection to map + dedupe users.
 * Spread these into your users collection `fields`.
 *
 *   fields: [...iamAuthFields, ...yourFields]
 *
 * NOTE: `email` is intentionally NOT here — the local auth strategy adds it.
 * A collection with `disableLocalStrategy: true` must add an `email` field
 * itself.
 */
export const iamAuthFields: Field[] = [
  {
    name: 'iamSub',
    type: 'text',
    admin: { description: 'Hanzo IAM subject (user id).', readOnly: true },
    index: true,
    label: 'IAM Subject',
    unique: true,
  },
  {
    name: 'iamOrg',
    type: 'text',
    admin: { description: 'Hanzo IAM org slug (== tenant).', readOnly: true },
    index: true,
    label: 'IAM Org',
  },
  {
    name: 'username',
    type: 'text',
    label: 'Username',
  },
  {
    name: 'isAdmin',
    type: 'checkbox',
    admin: {
      description: 'Administers the org in IAM Org. Grants nothing outside it.',
      readOnly: true,
    },
    index: true,
    label: 'Org Admin',
  },
  {
    name: 'groups',
    type: 'json',
    admin: { description: 'Hanzo IAM group slugs.', readOnly: true },
    label: 'IAM Groups',
  },
]
