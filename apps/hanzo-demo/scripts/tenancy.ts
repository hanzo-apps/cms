/**
 * Tenant boundary acceptance proof, against this app's real config and a real
 * database. Two tenants, three principals, every call through the access layer
 * (`overrideAccess: false`), so a refusal is the same 403 a REST caller gets.
 *
 * Run: HANZO_ORG=tenancy-proof tsx scripts/tenancy.ts
 */
import { getCMS } from '@hanzo/cms'

const step = (m: string) => {
  console.log(`\n=== ${m} ===`)
}

const ok = (m: string) => {
  console.log(`  ✓ ${m}`)
}

const fail = (m: string) => {
  console.error(`  ✗ ${m}`)
  process.exitCode = 1
}

/** Record one assertion: `passed` prints the claim, otherwise `detail` prints why. */
const check = (passed: boolean, claim: string, detail: string) => {
  if (passed) {
    ok(claim)
  } else {
    fail(detail)
  }
}

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

  const config = (await import('../src/payload.config.js')).default
  const cms = await getCMS({ config })

  const tenantFor = async (slug: string) => {
    const found = await cms.find({
      collection: 'tenants',
      limit: 1,
      where: { slug: { equals: slug } },
    })
    return (
      found.docs[0] ?? (await cms.create({ collection: 'tenants', data: { name: slug, slug } }))
    )
  }

  const acme = await tenantFor('acme')
  const maxpower = await tenantFor('maxpower')

  const principal = async (email: string, iamOrg: string, isAdmin: boolean, tenant?: unknown) => {
    const found = await cms.find({
      collection: 'users',
      limit: 1,
      where: { email: { equals: email } },
    })
    const data = {
      email,
      iamOrg,
      iamSub: email,
      isAdmin,
      ...(tenant ? { tenants: [{ tenant }] } : {}),
    }
    const doc = found.docs[0]
      ? await cms.update({ id: found.docs[0].id, collection: 'users', data })
      : await cms.create({
          collection: 'users',
          data: { ...data, password: 'proof-only-never-shipped' },
        })
    return { ...doc, collection: 'users' }
  }

  // Both org admins carry `isAdmin`, so a predicate reading it as a platform
  // privilege shows up in every cross-tenant case below.
  const acmeAdmin = await principal('acme-admin@iam.local', 'acme', true, acme.id)
  const maxAdmin = await principal('max-admin@iam.local', 'maxpower', true, maxpower.id)
  const superAdmin = await principal('super@iam.local', 'admin', false, acme.id)

  step("Seed: one page per tenant, written by that tenant's own admin")
  const acmePage = await cms.create({
    collection: 'pages',
    data: { slug: `acme-${Date.now()}`, tenant: acme.id, title: 'Acme Private' },
    overrideAccess: false,
    user: acmeAdmin,
  })
  ok(`acme admin created a page in their OWN tenant (id=${acmePage.id})`)

  const maxPage = await cms.create({
    collection: 'pages',
    data: { slug: `max-${Date.now()}`, tenant: maxpower.id, title: 'MaxPower Private' },
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
      data: { slug: `steal-${Date.now()}`, tenant: maxpower.id, title: 'Planted' },
      overrideAccess: false,
      user: acmeAdmin,
    }),
  )

  await expectForbidden("acme admin MOVING their page into maxpower's tenant", () =>
    cms.update({
      id: acmePage.id,
      collection: 'pages',
      data: { tenant: maxpower.id },
      overrideAccess: false,
      user: acmeAdmin,
    }),
  )

  await expectForbidden('acme admin planting a DRAFT, where validate is skipped', () =>
    cms.create({
      collection: 'pages',
      data: { slug: `draft-${Date.now()}`, _status: 'draft', tenant: maxpower.id, title: 'Draft' },
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

  // Control: the strategy writes through the local API, which overrides access,
  // so a sign-in must still be able to set the claim fields.
  const byStrategy = await cms.update({
    id: acmeAdmin.id,
    collection: 'users',
    data: { iamOrg: 'acme-renamed' },
  })
  check(
    (byStrategy as { iamOrg?: string }).iamOrg === 'acme-renamed',
    'the strategy still writes iamOrg on sign-in',
    'the field guard also blocked the strategy',
  )
  await cms.update({ id: acmeAdmin.id, collection: 'users', data: { iamOrg: 'acme' } })

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
    data: { slug: `super-${Date.now()}`, tenant: maxpower.id, title: 'Super Write' },
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

  console.log(
    process.exitCode ? '\n=== TENANCY PROOF FAILED ===' : '\n=== TENANCY PROOF COMPLETE ===',
  )
  process.exit(process.exitCode || 0)
}

run().catch((e) => {
  console.error('TENANCY PROOF FAILED:', e)
  process.exit(1)
})
