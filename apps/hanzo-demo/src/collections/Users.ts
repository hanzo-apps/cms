import type { CollectionConfig } from '@hanzo/cms'

import { clearIAMCookies, hanzoIAMStrategy, iamAuthFields, iamRefresh } from '@hanzo/cms-auth-iam'

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
    // `{ enableFields: true }` rather than `true`: the auth fields stay in the
    // schema, so email / salt / hash / login_attempts / lock_until / sessions
    // remain columns and the live database needs no migration to adopt this.
    // `useAsTitle: 'email'` keeps working for the same reason. Nothing writes a
    // password any more; the columns simply stay empty.
    disableLocalStrategy: { enableFields: true },
    strategies: [hanzoIAMStrategy()],
    // Eight hours, matching the IAM client's own token lifetime. The two are one
    // fact — a cookie outliving its token is a session that looks alive and
    // authenticates as nobody.
    tokenExpiration: 28800,
  },
  fields: [
    // `email` comes from the auth fields, which `enableFields` keeps; iamAuthFields
    // carries the IAM claim-mapping fields only.
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
