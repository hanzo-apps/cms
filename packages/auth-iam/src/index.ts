import type { Field } from '@hanzo/cms'

export type { HanzoIAMStrategyConfig, IAMClaims } from './types.js'
export { hanzoIAMStrategy } from './strategy.js'

/**
 * Fields the IAM strategy needs on the auth collection to map + dedupe users.
 * Spread these into your users collection `fields`.
 *
 *   fields: [...iamAuthFields, ...yourFields]
 */
export const iamAuthFields: Field[] = [
  {
    name: 'iamSub',
    type: 'text',
    admin: { readOnly: true, description: 'Hanzo IAM subject (user id).' },
    index: true,
    label: 'IAM Subject',
    unique: true,
  },
  {
    name: 'iamOrg',
    type: 'text',
    admin: { readOnly: true, description: 'Hanzo IAM org slug (== tenant).' },
    index: true,
    label: 'IAM Org',
  },
  {
    name: 'username',
    type: 'text',
    label: 'Username',
  },
]
