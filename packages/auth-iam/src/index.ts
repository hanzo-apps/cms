import type { Field } from '@hanzo/cms'

export { hanzoIAMStrategy } from './strategy.js'
export { hanzoProxyStrategy } from './proxy.js'
export type { HanzoIAMStrategyConfig, HanzoProxyStrategyConfig, IAMClaims } from './types.js'

/**
 * Fields the IAM strategy needs on the auth collection to map + dedupe users.
 * Spread these into your users collection `fields`.
 *
 *   fields: [...iamAuthFields, ...yourFields]
 */
export const iamAuthFields: Field[] = [
  {
    // Auth collections with `disableLocalStrategy: true` do NOT get the email
    // field auto-added (that comes from the local strategy), so add it here.
    name: 'email',
    type: 'email',
    index: true,
    label: 'Email',
  },
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
]
