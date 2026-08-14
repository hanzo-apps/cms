import type { CMS } from '@hanzo/cms'

import { randomBytes } from 'crypto'

/**
 * Provision the platform SuperAdmin: one user in the reserved `admin` org, the
 * only scope that crosses a tenant boundary. Created here rather than raised
 * from a tenant user, so the two scopes stay held by two identities.
 *
 * Runs on every boot and does nothing once the org has a member. Writes through
 * the local API, which overrides access, so it sets the claim fields a client
 * cannot.
 *
 * The password comes from KMS via CMS_SUPERUSER_PASSWORD. Without it the row is
 * still created, holding a random value nobody can present — the account then
 * reaches the panel only once that secret is set. The row also decides the
 * shape of a fresh database: an empty user table is what the framework reads as
 * "nobody has claimed this deployment yet".
 */
export const seedSuperAdmin = async (cms: CMS): Promise<void> => {
  const existing = await cms.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    where: { iamOrg: { equals: 'admin' } },
  })

  if (existing.docs.length) {
    return
  }

  const email = process.env.CMS_SUPERUSER_EMAIL || 'z@admin.hanzo.ai'

  await cms.create({
    collection: 'users',
    data: {
      email,
      iamOrg: 'admin',
      isAdmin: false,
      password: process.env.CMS_SUPERUSER_PASSWORD || randomBytes(32).toString('base64url'),
      username: 'z',
    },
  })

  cms.logger.info(`Seeded the admin-org superuser ${email}`)
}
