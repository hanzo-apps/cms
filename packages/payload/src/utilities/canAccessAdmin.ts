import type { CMSRequest } from '../types/index.js'

import { UnauthorizedError } from '../errors/UnauthorizedError.js'

/**
 * Protects admin-only routes, server functions, etc.
 * The requesting user must either:
 * a. pass the `access.admin` function on the `users` collection, if defined
 * b. match the `config.admin.user` property on the CMS config
 * c. if no user is present, and there are no users in the system, allow access (for first user creation)
 * @throws {Error} Throws an `Unauthorized` error if access is denied that can be explicitly caught
 */
export const canAccessAdmin = async ({ req }: { req: CMSRequest }) => {
  const incomingUserSlug = req.user?.collection
  const adminUserSlug = req.cms.config.admin.user

  if (incomingUserSlug) {
    const adminAccessFn = req.cms.collections[incomingUserSlug]?.config.access?.admin

    if (adminAccessFn) {
      const canAccess = await adminAccessFn({ req })

      if (!canAccess) {
        throw new UnauthorizedError()
      }
      // Match the user collection to the global admin config
    } else if (adminUserSlug !== incomingUserSlug) {
      throw new UnauthorizedError()
    }
  } else {
    // The allowance below exists for ONE flow: letting the first user be created
    // on an empty installation. A collection with no local strategy cannot create
    // one — registerFirstUser refuses it — so on such a collection the allowance
    // has nothing left to permit and can only grant. That matters because an
    // SSO-only installation starts empty by construction: users are provisioned
    // from verified claims on first sign-in, so the table is empty until somebody
    // signs in, and the allowance would hand the admin's server functions to
    // whoever asked first.
    if (req.cms.collections[adminUserSlug]?.config.auth?.disableLocalStrategy) {
      throw new UnauthorizedError()
    }

    const hasUsers = await req.cms.find({
      collection: adminUserSlug,
      depth: 0,
      limit: 1,
      pagination: false,
    })

    // If there are users, we should not allow access because of `/create-first-user`
    if (hasUsers.docs.length) {
      throw new UnauthorizedError()
    }
  }
}
