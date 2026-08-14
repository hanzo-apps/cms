/**
 * Platform SuperAdmin: membership in the reserved `admin` org, which arrives as
 * the IAM `owner` claim and is mapped onto the user as `iamOrg`. The only scope
 * that crosses a tenant boundary.
 *
 * `isAdmin` is org-scoped — it names the administrator of the org in `iamOrg`,
 * and every org has one — so it is not consulted here.
 */
export const isSuperAdmin = (user: unknown): boolean =>
  (user as { iamOrg?: unknown } | null)?.iamOrg === 'admin'
