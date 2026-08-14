/**
 * HTTP acceptance proof. Drives the same handlers the app mounts at
 * /api/[...slug], so routing, endpoint matching, the auth strategies and access
 * all run — a refusal here is the status a caller receives.
 *
 * Run: tsx scripts/http.ts
 */
import { getCMS } from '@hanzo/cms'
import { REST_GET, REST_POST } from '@hanzo/cms-next/routes'

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

const check = (passed: boolean, claim: string, detail: string) => {
  if (passed) {
    ok(claim)
  } else {
    fail(detail)
  }
}

const API = 'http://cms.test/api'

const run = async () => {
  process.env.HANZO_ORG = process.env.HANZO_ORG || 'http-proof'
  process.env.CMS_SUPERUSER_PASSWORD = 'proof-only-superuser-password'

  const config = (await import('../src/payload.config.js')).default
  // Booting runs onInit, which is where the superuser is provisioned.
  const cms = await getCMS({ config })

  const post = REST_POST(config)
  const get = REST_GET(config)

  const call = async (
    handler: typeof post,
    method: string,
    path: string,
    init: { body?: unknown; token?: string } = {},
  ) => {
    const request = new Request(`${API}/${path}`, {
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      headers: {
        'Content-Type': 'application/json',
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      method,
    })
    const response = await handler(request, { params: Promise.resolve({ slug: path.split('/') }) })
    return { body: await response.text(), status: response.status }
  }

  // ---- the superuser the seed provisions -------------------------------
  step('Seed')
  const supers = await cms.find({
    collection: 'users',
    where: { iamOrg: { equals: 'admin' } },
  })
  check(
    supers.totalDocs === 1,
    `the admin org holds one member (${(supers.docs[0] as { email?: string })?.email})`,
    `expected one admin-org user, found ${supers.totalDocs}`,
  )

  const login = await call(post, 'POST', 'users/login', {
    body: {
      email: (supers.docs[0] as { email?: string })?.email ?? 'absent',
      password: 'proof-only-superuser-password',
    },
  })
  const superToken = (JSON.parse(login.body) as { token?: string }).token
  check(Boolean(superToken), 'the superuser signs in at the panel', `login -> ${login.status}`)

  // ---- H1 --------------------------------------------------------------
  // canAccessAdmin lets an anonymous caller through while the user table is
  // empty, which is what every admin server function is guarded by. The seeded
  // row is what makes it non-empty.
  const { canAccessAdmin } = await import('@hanzo/cms')
  let adminDenied = false
  try {
    await canAccessAdmin({
      req: { cms, user: null } as Parameters<typeof canAccessAdmin>[0]['req'],
    })
  } catch {
    adminDenied = true
  }
  check(
    adminDenied,
    'the admin surface refuses an anonymous caller',
    'anonymous reached the admin surface',
  )

  // ---- an ordinary tenant admin ----------------------------------------
  const tenant = await cms.create({ collection: 'tenants', data: { name: 'acme', slug: 'acme' } })
  await cms.create({
    collection: 'users',
    data: {
      email: 'acme-admin@iam.local',
      iamOrg: 'acme',
      iamSub: 'acme-sub',
      isAdmin: true,
      password: 'proof-only-acme-password',
      tenants: [{ tenant: tenant.id }],
    },
  })
  const acmeLogin = await call(post, 'POST', 'users/login', {
    body: { email: 'acme-admin@iam.local', password: 'proof-only-acme-password' },
  })
  const acmeToken = (JSON.parse(acmeLogin.body) as { token?: string }).token

  // The local strategy reads a cookie, so drive these through the same
  // authenticated request the browser makes.
  const asUser = async (
    handler: typeof post,
    method: string,
    path: string,
    token: string,
    body?: unknown,
  ) => {
    const request = new Request(`${API}/${path}`, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${config.cookiePrefix ?? 'cms'}-token=${token}`,
      },
      method,
    })
    const response = await handler(request, { params: Promise.resolve({ slug: path.split('/') }) })
    return { body: await response.text(), status: response.status }
  }

  // ---- C1 --------------------------------------------------------------
  step('first-register is refused')
  const anonRegister = await call(post, 'POST', 'users/first-register', {
    body: {
      email: 'attacker@evil.test',
      iamOrg: 'admin',
      isAdmin: true,
      password: 'attacker-chosen',
    },
  })
  check(
    anonRegister.status === 403,
    `anonymous POST /users/first-register -> ${anonRegister.status}`,
    `anonymous first-register -> ${anonRegister.status}, expected 403`,
  )

  const authedRegister = await asUser(post, 'POST', 'users/first-register', acmeToken!, {
    email: 'attacker2@evil.test',
    iamOrg: 'admin',
    password: 'attacker-chosen',
  })
  check(
    authedRegister.status === 403,
    `authenticated POST /users/first-register -> ${authedRegister.status}`,
    `authenticated first-register -> ${authedRegister.status}, expected 403`,
  )

  const minted = await cms.find({
    collection: 'users',
    where: { email: { in: ['attacker@evil.test', 'attacker2@evil.test'] } },
  })
  check(
    minted.totalDocs === 0,
    'neither attempt created a user',
    `${minted.totalDocs} row(s) created`,
  )

  // ---- M2 --------------------------------------------------------------
  step('tenants and the job control plane refuse a non-super')
  const squat = await asUser(post, 'POST', 'tenants', acmeToken!, {
    name: 'karma',
    slug: 'karma',
  })
  check(
    squat.status === 403,
    `org admin POST /tenants -> ${squat.status}`,
    `tenant squat -> ${squat.status}, expected 403`,
  )

  const superTenant = await asUser(post, 'POST', 'tenants', superToken!, {
    name: 'karma',
    slug: 'karma',
  })
  check(
    superTenant.status === 201,
    `super POST /tenants -> ${superTenant.status}`,
    `super tenant create -> ${superTenant.status}, expected 201`,
  )

  const jobsRead = await asUser(get, 'GET', 'cms-jobs', acmeToken!)
  check(
    jobsRead.status === 403,
    `org admin GET /cms-jobs -> ${jobsRead.status}`,
    `jobs read -> ${jobsRead.status}, expected 403`,
  )

  const jobsRun = await asUser(get, 'GET', 'cms-jobs/run', acmeToken!)
  check(
    jobsRun.status === 401 || jobsRun.status === 403,
    `org admin GET /cms-jobs/run -> ${jobsRun.status}`,
    `jobs run -> ${jobsRun.status}, expected 401 or 403`,
  )

  // ---- F3 --------------------------------------------------------------
  step('a first SSO login provisions a row')
  const { hanzoIAMStrategy } = await import('@hanzo/cms-auth-iam')
  const strategy = hanzoIAMStrategy()
  const iamToken = process.env.IAM_TOKEN
  if (iamToken) {
    const before = await cms.find({ collection: 'users' })
    const result = await strategy.authenticate({
      canSetHeaders: true,
      cms,
      headers: new Headers({ authorization: `Bearer ${iamToken}` }),
    } as Parameters<typeof strategy.authenticate>[0])
    const after = await cms.find({ collection: 'users' })
    check(
      Boolean(result.user) && after.totalDocs === before.totalDocs + 1,
      `a subject the database has never seen is provisioned (iamOrg=${(result.user as { iamOrg?: string })?.iamOrg})`,
      'the first SSO login did not provision a row',
    )
  } else {
    console.log('  (skipped: set IAM_TOKEN to a real hanzo.id token)')
  }

  // ---- F4 --------------------------------------------------------------
  step('audience confines a token to this deployment')
  const confined = hanzoIAMStrategy({ audience: ['hanzo-cms'] })
  if (iamToken) {
    const rejected = await confined.authenticate({
      canSetHeaders: true,
      cms,
      headers: new Headers({ authorization: `Bearer ${iamToken}` }),
    } as Parameters<typeof confined.authenticate>[0])
    check(
      rejected.user === null,
      'a token minted for another client is refused when the audience is named',
      'a foreign-audience token authenticated',
    )
  } else {
    console.log('  (skipped: set IAM_TOKEN to a real hanzo.id token)')
  }

  // ---- C1 on an empty table --------------------------------------------
  // The framework refuses first-register once any user exists, so the seeded
  // row alone would make the cases above pass. Empty the table to reproduce a
  // database nobody has signed into yet — the state the route is reachable in —
  // and confirm the refusal comes from the route being replaced. Runs last: it
  // invalidates every session above.
  step('first-register is refused on a database with no users')
  for (const doc of (await cms.find({ collection: 'users', limit: 100 })).docs) {
    await cms.delete({ id: doc.id, collection: 'users' })
  }
  const emptied = await cms.find({ collection: 'users' })
  check(emptied.totalDocs === 0, 'the user table is empty', 'the table did not empty')

  const onEmpty = await call(post, 'POST', 'users/first-register', {
    body: {
      email: 'attacker3@evil.test',
      iamOrg: 'admin',
      isAdmin: true,
      password: 'attacker-chosen',
    },
  })
  check(
    onEmpty.status === 403,
    `anonymous POST /users/first-register on an empty table -> ${onEmpty.status}`,
    `empty-table first-register -> ${onEmpty.status}, expected 403`,
  )

  const afterEmpty = await cms.find({ collection: 'users' })
  check(
    afterEmpty.totalDocs === 0,
    'no user was created',
    `${afterEmpty.totalDocs} row(s) created, iamOrg=${(afterEmpty.docs[0] as { iamOrg?: string })?.iamOrg}`,
  )

  console.log(process.exitCode ? '\n=== HTTP PROOF FAILED ===' : '\n=== HTTP PROOF COMPLETE ===')
  process.exit(process.exitCode || 0)
}

run().catch((e) => {
  console.error('HTTP PROOF FAILED:', e)
  process.exit(1)
})
