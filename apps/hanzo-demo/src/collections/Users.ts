import type { CollectionConfig } from '@hanzo/cms'

import {
  claimOnly,
  clearIAMCookies,
  hanzoIAMStrategy,
  iamAuthFields,
  iamRefresh,
} from '@hanzo/cms-auth-iam'

/**
 * Users authenticate through Hanzo IAM and through nothing else. The IAM access
 * token IS the session: it arrives as a Bearer header from an API client or in
 * this collection's own session cookie from the admin, and the IAM strategy
 * verifies either against the published JWKS.
 *
 * There is no local password. `disableLocalStrategy` refuses login, first-user
 * registration, forgot/reset password, verification and unlock at the framework
 * level, so those doors are shut by the framework rather than by a handler of
 * ours that has to be kept correct.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // The session this cookie carries reaches every tenant when it belongs to
    // the reserved org, so it travels over TLS only. Lax and not Strict because
    // the browser returns from IAM by top-level navigation, which Strict would
    // not send the cookie on — the sign-in would complete and read as failed.
    cookies: { sameSite: 'Lax', secure: true },
    // No local fields at all. Keeping them would leave a writable password path
    // — a PATCH carrying `password` still writes salt and hash, which no field
    // access governs — and an HS256 verifier that would accept a token this
    // deployment's own secret could sign. Both are unreachable while this is the
    // only auth collection, and both become reachable the moment a second one
    // registers the local strategy globally. An invariant that holds by accident
    // is not one; removing the fields removes the question.
    //
    // `email` is declared below instead, on the column that already exists.
    disableLocalStrategy: true,
    // `/me` and `/refresh-token` otherwise echo the raw IAM bearer into
    // same-origin JavaScript. That token is the caller's credential for EVERY
    // Hanzo service, not just this one, so a scripting bug here would not leak a
    // CMS session — it would leak a portable platform credential with hours left
    // on it. The admin reads its session from the cookie and never needs the
    // string.
    removeTokenFromResponses: true,
    strategies: [hanzoIAMStrategy()],
    // Eight hours, matching the IAM client's own token lifetime. The two are one
    // fact — a cookie outliving its token is a session that looks alive and
    // authenticates as nobody.
    tokenExpiration: 28800,
  },
  fields: [
    // The identity IAM sends, on the column that has always held it: text, not
    // null, unique index `users_email_idx`. Declaring it exactly as the local
    // strategy did means the schema still describes the live table, so removing
    // that strategy needs no migration. `useAsTitle` reads it.
    //
    // Claim-written like every other identity field: it names who someone is,
    // and it arrives from IAM, so a caller editing their own row cannot set it.
    {
      name: 'email',
      type: 'email',
      access: claimOnly,
      admin: { description: 'From the IAM token.', readOnly: true },
      index: true,
      label: 'Email',
      required: true,
      unique: true,
    },
    ...iamAuthFields,
  ],
  hooks: {
    // Ends the tenant selection with the session.
    afterLogout: [clearIAMCookies],
    // Answers refresh with the IAM token the caller already holds. Without it the
    // operation signs a CMS JWT the IAM strategy cannot verify, and the editor is
    // logged out on the next route change with nothing to show why.
    refresh: [iamRefresh],
  },
}
