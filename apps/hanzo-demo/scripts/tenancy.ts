/**
 * Tenant boundary acceptance proof, against this app's real config and a real
 * database. Two tenants, three principals, every call through the access layer
 * (`overrideAccess: false`), so a refusal is the same 403 a REST caller gets.
 *
 * The principals are not written by hand: each one signs in with an IAM token
 * minted against a local key set (scripts/iam.ts), so the rows under test carry
 * the identity and the tenancy the strategy derived from verified claims.
 *
 * Run: HANZO_ORG=tenancy-proof tsx scripts/tenancy.ts
 */

import { getCMS } from '@hanzo/cms'
import { hanzoIAMStrategy } from '@hanzo/cms-auth-iam'

import type { Claims } from './iam.js'

import { check, fail, ok, step } from './check.js'
import { openIAM } from './iam.js'

/** Run a call that must be refused, and assert it is refused with a 403. */
const expectForbidden = async (label: string, call: () => Promise<unknown>) => {
  try {
    await call()
  } catch (error) {
    const status = (error as { status?: number }).status
    check(
      status === 403,
      `${label} -> 403`,
      `${label} threw ${status ?? (error as Error).message}, expected 403`,
    )
    return
  }
  fail(`${label} was ALLOWED`)
}

const run = async () => {
  process.env.HANZO_ORG = process.env.HANZO_ORG || 'tenancy-proof'

  // Before the config: the strategy reads the IAM variables when it is built,
  // and importing the config builds it.
  const iam = await openIAM()

  const config = await (await import('../src/payload.config.js')).default
  const cms = await getCMS({ config })

  const strategy = hanzoIAMStrategy()

  /** Sign in with these claims and return the principal the strategy mapped them to. */
  const signIn = async (claims: Claims) => {
    const { user } = await strategy.authenticate({
      canSetHeaders: false,
      cms,
      headers: new Headers({ authorization: `Bearer ${iam.mint(claims)}` }),
    } as Parameters<typeof strategy.authenticate>[0])
    return user as { iamOrg?: string; id: number | string; isAdmin?: boolean; tenants?: unknown[] }
  }

  const acmeClaims: Claims = {
    name: 'acme-admin',
    email: 'acme-admin@iam.local',
    orgs: [{ org: 'acme', role: 'admin' }],
    owner: 'acme',
    sub: 'acme-admin',
  }
  const maxClaims: Claims = {
    name: 'max-admin',
    email: 'max-admin@iam.local',
    orgs: [{ org: 'maxpower', role: 'admin' }],
    owner: 'maxpower',
    sub: 'max-admin',
  }
  const superClaims: Claims = {
    name: 'super',
    email: 'super@iam.local',
    orgs: [{ org: 'admin', role: 'member' }],
    owner: 'admin',
    sub: 'super',
  }

  // Both org admins carry `isAdmin`, so a predicate reading it as a platform
  // privilege shows up in every cross-tenant case below. The super carries none:
  // membership in the reserved org is the whole of platform privilege.
  const acmeAdmin = await signIn(acmeClaims)
  const maxAdmin = await signIn(maxClaims)
  const superAdmin = await signIn(superClaims)

  const tenantID = async (slug: string) => {
    const found = await cms.find({
      collection: 'tenants',
      limit: 1,
      where: { slug: { equals: slug } },
    })
    return found.docs[0]?.id
  }
  const acme = await tenantID('acme')
  const maxpower = await tenantID('maxpower')

  step('Signing in maps claims onto a principal')
  check(
    Boolean(acme && maxpower),
    'each org in the claims became a tenant',
    `orgs did not become tenants (acme=${acme}, maxpower=${maxpower})`,
  )
  check(
    acmeAdmin.isAdmin === true && superAdmin.isAdmin === false,
    'the home org role becomes isAdmin, which the super does not carry',
    `isAdmin: acme=${acmeAdmin.isAdmin}, super=${superAdmin.isAdmin}`,
  )
  check(
    superAdmin.iamOrg === 'admin',
    'the super is the `owner` claim naming the reserved org',
    `super iamOrg=${superAdmin.iamOrg}, expected admin`,
  )

  step("Seed: one page per tenant, written by that tenant's own admin")
  const acmePage = await cms.create({
    collection: 'pages',
    data: { slug: `acme-${Date.now()}`, tenant: acme, title: 'Acme Private' },
    overrideAccess: false,
    user: acmeAdmin,
  })
  ok(`acme admin created a page in their OWN tenant (id=${acmePage.id})`)

  const maxPage = await cms.create({
    collection: 'pages',
    data: { slug: `max-${Date.now()}`, tenant: maxpower, title: 'MaxPower Private' },
    overrideAccess: false,
    user: maxAdmin,
  })
  ok(`maxpower admin created a page in their OWN tenant (id=${maxPage.id})`)

  step('Control: own-tenant management is UNAFFECTED')
  const updated = await cms.update({
    id: acmePage.id,
    collection: 'pages',
    data: { title: 'Acme Private (edited)' },
    overrideAccess: false,
    user: acmeAdmin,
  })
  check(
    updated.title === 'Acme Private (edited)',
    'acme admin updated their own page',
    'acme admin could not update their own page',
  )

  const ownRead = await cms.find({ collection: 'pages', overrideAccess: false, user: acmeAdmin })
  const ownSlugs = ownRead.docs.map((d) => (d as { slug?: string }).slug)
  check(
    ownSlugs.includes(acmePage.slug as string),
    `acme admin reads their own page (${ownRead.totalDocs} doc(s) visible)`,
    'acme admin cannot read their own page',
  )

  step('Cross-tenant is DENIED for an org admin')
  check(
    !ownSlugs.includes(maxPage.slug as string),
    "maxpower's page is absent from the acme admin's list",
    `ISOLATION BREACH: acme admin listed [${ownSlugs.join(', ')}]`,
  )

  const byId = await cms.findByID({
    id: maxPage.id,
    collection: 'pages',
    disableErrors: true,
    overrideAccess: false,
    user: acmeAdmin,
  })
  check(
    !byId,
    "by-id read of maxpower's page is blocked",
    'ISOLATION BREACH: by-id read returned it',
  )

  await expectForbidden("acme admin WRITING into maxpower's tenant", () =>
    cms.create({
      collection: 'pages',
      data: { slug: `steal-${Date.now()}`, tenant: maxpower, title: 'Planted' },
      overrideAccess: false,
      user: acmeAdmin,
    }),
  )

  await expectForbidden("acme admin MOVING their page into maxpower's tenant", () =>
    cms.update({
      id: acmePage.id,
      collection: 'pages',
      data: { tenant: maxpower },
      overrideAccess: false,
      user: acmeAdmin,
    }),
  )

  await expectForbidden('acme admin planting a DRAFT, where validate is skipped', () =>
    cms.create({
      collection: 'pages',
      data: { slug: `draft-${Date.now()}`, _status: 'draft', tenant: maxpower, title: 'Draft' },
      draft: true,
      overrideAccess: false,
      user: acmeAdmin,
    }),
  )

  await expectForbidden('acme admin reading the job queue', () =>
    cms.find({ collection: 'cms-jobs', overrideAccess: false, user: acmeAdmin }),
  )

  step('`iamOrg` is written from claims only')
  // The field decides who crosses a tenant boundary, so a client able to write
  // it is a client able to promote itself. Field access drops the value rather
  // than refusing the request, so assert the stored value, not the status.
  const selfRaised = await cms.update({
    id: acmeAdmin.id,
    collection: 'users',
    data: { iamOrg: 'admin', isAdmin: true },
    overrideAccess: false,
    user: acmeAdmin,
  })
  check(
    (selfRaised as { iamOrg?: string }).iamOrg === 'acme',
    'an org admin writing iamOrg on their own row leaves it unchanged',
    `SELF-PROMOTION: iamOrg became ${(selfRaised as { iamOrg?: string }).iamOrg}`,
  )

  const stillScoped = await cms.find({
    collection: 'pages',
    overrideAccess: false,
    user: { ...selfRaised, collection: 'users' },
  })
  check(
    !stillScoped.docs.some((d) => (d as { slug?: string }).slug === maxPage.slug),
    'and they still cannot reach the other tenant',
    'SELF-PROMOTION reached another tenant',
  )

  step('Tenant membership is written from claims only')
  const selfJoined = await cms.update({
    id: acmeAdmin.id,
    collection: 'users',
    data: { tenants: [{ tenant: acme }, { tenant: maxpower }] },
    overrideAccess: false,
    user: acmeAdmin,
  })
  const joinedRows = (selfJoined as { tenants?: unknown[] }).tenants ?? []
  check(
    joinedRows.length === 1,
    'an org admin adding a foreign tenant to their own row leaves it unchanged',
    `SELF-JOIN: the row now holds ${joinedRows.length} tenants`,
  )

  const afterJoin = await cms.find({
    collection: 'pages',
    overrideAccess: false,
    user: { ...selfJoined, collection: 'users' },
  })
  check(
    !afterJoin.docs.some((d) => (d as { slug?: string }).slug === maxPage.slug),
    'and the other tenant stays unreachable',
    'SELF-JOIN reached another tenant',
  )

  step('Controls: a sign-in writes both')
  // The strategy writes through the local API, which overrides access. If these
  // fail, the guard that holds a caller is holding IAM too, and every sign-in
  // silently stops assigning identity and tenancy.
  const rejoined = await signIn({
    ...acmeClaims,
    orgs: [
      { org: 'acme-renamed', role: 'admin' },
      { org: 'maxpower', role: 'member' },
    ],
    owner: 'acme-renamed',
  })
  check(
    rejoined.iamOrg === 'acme-renamed',
    'a sign-in still writes iamOrg',
    `the field guard also blocked the strategy on iamOrg (iamOrg=${rejoined.iamOrg})`,
  )
  check(
    (rejoined.tenants ?? []).length === 2,
    'a sign-in still writes tenant membership',
    `the field guard also blocked the strategy on tenants (${(rejoined.tenants ?? []).length})`,
  )
  // A membership dropped upstream is dropped here on the next arrival.
  const restored = await signIn(acmeClaims)
  check(
    restored.iamOrg === 'acme' && (restored.tenants ?? []).length === 1,
    'and the next sign-in drops what the claims no longer carry',
    `restored to iamOrg=${restored.iamOrg} with ${(restored.tenants ?? []).length} tenant(s)`,
  )

  step('The reserved `admin` org still crosses every tenant')
  const superRead = await cms.find({ collection: 'pages', overrideAccess: false, user: superAdmin })
  const superSlugs = superRead.docs.map((d) => (d as { slug?: string }).slug)
  check(
    superSlugs.includes(acmePage.slug as string) && superSlugs.includes(maxPage.slug as string),
    `super reads BOTH tenants (${superRead.totalDocs} doc(s))`,
    `super saw only [${superSlugs.join(', ')}]`,
  )

  const superWrite = await cms.create({
    collection: 'pages',
    data: { slug: `super-${Date.now()}`, tenant: maxpower, title: 'Super Write' },
    overrideAccess: false,
    user: superAdmin,
  })
  check(
    Boolean(superWrite.id),
    'super writes into a tenant it does not belong to',
    'super write refused',
  )

  const superJobs = await cms.find({
    collection: 'cms-jobs',
    overrideAccess: false,
    user: superAdmin,
  })
  check(
    typeof superJobs.totalDocs === 'number',
    'super reads the job queue',
    'super cannot read the job queue',
  )

  // The pages this run wrote. Principals and tenants come from claims and are
  // rewritten on every sign-in, so only the content accumulates.
  for (const id of [acmePage.id, maxPage.id, superWrite.id]) {
    await cms.delete({ id, collection: 'pages' })
  }

  console.log(
    process.exitCode ? '\n=== TENANCY PROOF FAILED ===' : '\n=== TENANCY PROOF COMPLETE ===',
  )
  process.exit(process.exitCode || 0)
}

run().catch((e) => {
  console.error('TENANCY PROOF FAILED:', e)
  process.exit(1)
})
