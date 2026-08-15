import type { Field } from '@hanzo/cms'

export { activeOrg } from './org.js'
export { clearIAMCookies, iamRefresh } from './refresh.js'
export { authorizeURL, beginAuth, exchangeCode, iamIssuer, signOutURL } from './session.js'
export { hanzoIAMStrategy, iamToken } from './strategy.js'
export { isSuperAdmin } from './super.js'
export type { HanzoIAMStrategyConfig, IAMClaims } from './types.js'

/**
 * Written from verified IAM claims and from nowhere else. `admin.readOnly` only
 * greys the input out; field access is what REST and GraphQL are held to. The
 * strategy writes through the local API, which overrides access, so it still
 * sets them on every sign-in.
 *
 * `iamOrg` decides who crosses a tenant boundary (see `isSuperAdmin`), so a
 * client able to write it is a client able to promote itself.
 */
export const claimOnly = { create: () => false, update: () => false }

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
    access: claimOnly,
    admin: { description: 'Hanzo IAM subject (user id).', readOnly: true },
    index: true,
    label: 'IAM Subject',
    unique: true,
  },
  {
    name: 'iamOrg',
    type: 'text',
    access: claimOnly,
    admin: { description: 'Hanzo IAM org slug (== tenant).', readOnly: true },
    index: true,
    label: 'IAM Org',
  },
  {
    name: 'username',
    type: 'text',
    access: claimOnly,
    label: 'Username',
  },
  {
    name: 'isAdmin',
    type: 'checkbox',
    access: claimOnly,
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
    access: claimOnly,
    admin: { description: 'Hanzo IAM group slugs.', readOnly: true },
    label: 'IAM Groups',
  },
]
