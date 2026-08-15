/**
 * HTTP acceptance proof. Drives the same handlers the app mounts at
 * /api/[...slug], so routing, endpoint matching, the auth strategies and access
 * all run — a refusal here is the status a caller receives.
 *
 * Callers arrive the way they do in production: an IAM token, as a Bearer
 * header or in the session cookie. scripts/iam.ts mints them against a local
 * key set, so the strategy verifies a real RS256 signature, a real issuer and a
 * real audience.
 *
 * Run: tsx scripts/http.ts
 */

import { getCMS } from '@hanzo/cms'
import { isSuperAdmin } from '@hanzo/cms-auth-iam'
import { REST_GET, REST_POST } from '@hanzo/cms-next/routes'

import type { Claims } from './iam.js'

import { check, step } from './check.js'
import { openIAM } from './iam.js'

const ORIGIN = 'http://cms.test'
const API = `${ORIGIN}/api`

type Principal = { iamOrg?: string; tenants?: unknown[] } | null

const run = async () => {
  process.env.HANZO_ORG = process.env.HANZO_ORG || 'http-proof'
  // Cookie-authenticated writes are checked against the configured host, so
  // these requests have to come from it. Otherwise a refusal reads as a denied
  // permission when it was a rejected origin.
  process.env.SERVER_URL = ORIGIN

  // Before the config: the strategy reads the IAM variables when it is built,
  // and importing the config builds it.
  const iam = await openIAM()

  const config = await (await import('../src/payload.config.js')).default
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
        Origin: ORIGIN,
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      method,
    })
    const response = await handler(request, { params: Promise.resolve({ slug: path.split('/') }) })
    return { body: await response.text(), status: response.status }
  }

  // The admin presents the same token in the session cookie, so drive the
  // browser's half of the surface through the cookie the browser sends.
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
        Origin: ORIGIN,
      },
      method,
    })
    const response = await handler(request, { params: Promise.resolve({ slug: path.split('/') }) })
    return { body: await response.text(), status: response.status }
  }

  const whoami = (body: string): Principal =>
    (JSON.parse(body) as { user?: Principal }).user ?? null

  const superClaims: Claims = {
    name: 'z',
    displayName: 'Platform Operator',
    email: 'z@hanzo.ai',
    orgs: [{ org: 'admin', role: 'admin' }],
    owner: 'admin',
    sub: 'super-sub',
  }
  const acmeClaims: Claims = {
    name: 'acme-admin',
    displayName: 'Acme Admin',
    email: 'acme-admin@iam.local',
    orgs: [{ org: 'acme', role: 'admin' }],
    owner: 'acme',
    sub: 'acme-sub',
  }
  const superToken = iam.mint(superClaims)
  const acmeToken = iam.mint(acmeClaims)

  // ---- the token IS the session ----------------------------------------
  step('An IAM token IS the session')
  const before = await cms.find({ collection: 'users', limit: 1 })
  const superMe = await call(get, 'GET', 'users/me', { token: superToken })
  const superUser = whoami(superMe.body)
  const after = await cms.find({ collection: 'users', limit: 1 })
  check(
    superUser?.iamOrg === 'admin' && after.totalDocs === before.totalDocs + 1,
    `a Bearer token signs in a subject the database has never seen (iamOrg=${superUser?.iamOrg})`,
    `bearer sign-in -> ${superMe.status}, iamOrg=${superUser?.iamOrg}, rows ${before.totalDocs} -> ${after.totalDocs}`,
  )

  // The bearer is a credential for EVERY Hanzo service, not only this one, and
  // these two responses reach same-origin JavaScript. Echoing it there turns a
  // scripting bug in the admin into theft of a portable platform credential with
  // hours left on it. The admin reads its session from the cookie and never
  // needs the string.
  const meBody = JSON.parse(superMe.body) as Record<string, unknown>
  check(
    !('token' in meBody) && !('refreshedToken' in meBody),
    'GET /users/me returns no token',
    `me echoed: ${Object.keys(meBody).join(', ')}`,
  )
  const refreshed = await call(post, 'POST', 'users/refresh-token', { token: superToken })
  const refreshBody = JSON.parse(refreshed.body) as Record<string, unknown>
  check(
    !('refreshedToken' in refreshBody) && !('token' in refreshBody),
    `POST /users/refresh-token returns no token (${refreshed.status})`,
    `refresh echoed: ${Object.keys(refreshBody).join(', ')}`,
  )

  const acmeMe = await asUser(get, 'GET', 'users/me', acmeToken)
  const acmeUser = whoami(acmeMe.body)
  check(
    acmeUser?.iamOrg === 'acme',
    `the same token in the ${config.cookiePrefix ?? 'cms'}-token cookie signs a caller in (iamOrg=${acmeUser?.iamOrg})`,
    `cookie sign-in -> ${acmeMe.status}, iamOrg=${acmeUser?.iamOrg}`,
  )

  const supers = await cms.find({
    collection: 'users',
    where: { iamOrg: { equals: 'admin' } },
  })
  check(
    supers.totalDocs === 1,
    `the admin org holds one member (${(supers.docs[0] as { email?: string })?.email})`,
    `expected one admin-org user, found ${supers.totalDocs}`,
  )

  // ---- H1 --------------------------------------------------------------
  // canAccessAdmin guards every admin server function. With no local strategy
  // there is no first-user flow left for it to let an anonymous caller into.
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

  // ---- there is no password to present ---------------------------------
  step('the local strategy is off')
  const login = await call(post, 'POST', 'users/login', {
    body: { email: 'z@hanzo.ai', password: 'proof-only-guess' },
  })
  check(
    login.status === 403,
    `POST /users/login -> ${login.status}`,
    `login -> ${login.status}, expected 403`,
  )

  // A collection that kept the auth FIELDS while disabling the strategy still
  // accepted a password on an ordinary update, and writing one writes salt and
  // hash — columns no field access governs, because they are the framework's
  // rather than the config's. That row could then be signed in against by
  // anything that verifies a local credential. There are no such columns now, so
  // there is nothing for the write to land in.
  const adminRows = await cms.find({
    collection: 'users',
    where: { iamOrg: { equals: 'admin' } },
  })
  const superRow = adminRows.docs[0] as { id: number | string }
  await call(post, 'PATCH', `users/${superRow.id}`, {
    body: { password: 'a-password-nobody-asked-for' },
    token: superToken,
  })
  const rowAfter = (await cms.findByID({
    id: superRow.id,
    collection: 'users',
    showHiddenFields: true,
  })) as Record<string, unknown>
  check(
    !rowAfter.salt && !rowAfter.hash && !rowAfter.password,
    'a password sent on an update writes no credential',
    `update left salt=${String(rowAfter.salt)} hash=${String(rowAfter.hash)}`,
  )

  // ---- a token this deployment did not issue ---------------------------
  // Both carry the SUPERUSER's claims and differ from a working token in one
  // fact each, so a check that stopped running would hand over platform sudo.
  step('a token this deployment did not issue is refused')
  const foreign = iam.mint({ ...superClaims, aud: 'some-other-app' })
  const foreignMe = await call(get, 'GET', 'users/me', { token: foreign })
  check(
    whoami(foreignMe.body) === null,
    'a token addressed to another client authenticates as nobody',
    `a foreign-audience token signed in as ${whoami(foreignMe.body)?.iamOrg}`,
  )
  const foreignTenant = await call(post, 'POST', 'tenants', {
    body: { name: 'foreign', slug: 'foreign' },
    token: foreign,
  })
  check(
    foreignTenant.status === 403,
    `foreign-audience POST /tenants -> ${foreignTenant.status}`,
    `foreign-audience tenant create -> ${foreignTenant.status}, expected 403`,
  )

  const forged = iam.forge(superClaims)
  const forgedMe = await call(get, 'GET', 'users/me', { token: forged })
  check(
    whoami(forgedMe.body) === null,
    'a token signed by a key the JWKS never published authenticates as nobody',
    `a forged token signed in as ${whoami(forgedMe.body)?.iamOrg}`,
  )
  const forgedTenant = await call(post, 'POST', 'tenants', {
    body: { name: 'forged', slug: 'forged' },
    token: forged,
  })
  check(
    forgedTenant.status === 403,
    `forged POST /tenants -> ${forgedTenant.status}`,
    `forged tenant create -> ${forgedTenant.status}, expected 403`,
  )

  // ---- the reserved org is the `owner` claim ---------------------------
  // `orgs` is the tenancy set; `owner` is the home org. Reading the set would
  // hand platform sudo to anyone IAM ever added to `admin` as a member.
  step('membership in `admin` does not make a super')
  const impostorToken = iam.mint({
    name: 'impostor',
    email: 'impostor@iam.local',
    orgs: [
      { org: 'acme', role: 'admin' },
      { org: 'admin', role: 'member' },
    ],
    owner: 'acme',
    sub: 'impostor-sub',
  })
  const impostor = whoami((await call(get, 'GET', 'users/me', { token: impostorToken })).body)
  check(
    impostor?.iamOrg === 'acme',
    `iamOrg is the owner claim (${impostor?.iamOrg}), not an org the token lists`,
    `iamOrg became ${impostor?.iamOrg}, expected acme`,
  )
  check(
    !isSuperAdmin(impostor),
    'a caller whose home org is a tenant is NOT a super, even listing `admin` in orgs',
    'ESCALATION: listing `admin` in orgs made a super',
  )
  const impostorTenant = await call(post, 'POST', 'tenants', {
    body: { name: 'impostor', slug: 'impostor' },
    token: impostorToken,
  })
  check(
    impostorTenant.status === 403,
    `impostor POST /tenants -> ${impostorTenant.status}`,
    `impostor tenant create -> ${impostorTenant.status}, expected 403`,
  )

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

  const authedRegister = await asUser(post, 'POST', 'users/first-register', acmeToken, {
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
  const squat = await asUser(post, 'POST', 'tenants', acmeToken, {
    name: 'karma',
    slug: 'karma',
  })
  check(
    squat.status === 403,
    `org admin POST /tenants -> ${squat.status}`,
    `tenant squat -> ${squat.status}, expected 403`,
  )

  const superTenant = await call(post, 'POST', 'tenants', {
    body: { name: 'karma', slug: 'karma' },
    token: superToken,
  })
  check(
    superTenant.status === 201,
    `super POST /tenants -> ${superTenant.status}`,
    `super tenant create -> ${superTenant.status}, expected 201`,
  )

  const jobsRead = await asUser(get, 'GET', 'cms-jobs', acmeToken)
  check(
    jobsRead.status === 403,
    `org admin GET /cms-jobs -> ${jobsRead.status}`,
    `jobs read -> ${jobsRead.status}, expected 403`,
  )

  const jobsRun = await asUser(get, 'GET', 'cms-jobs/run', acmeToken)
  check(
    jobsRun.status === 401 || jobsRun.status === 403,
    `org admin GET /cms-jobs/run -> ${jobsRun.status}`,
    `jobs run -> ${jobsRun.status}, expected 401 or 403`,
  )

  // ---- C1 on an empty table --------------------------------------------
  // The framework refuses first-register once any user exists, so the rows
  // above would make the cases above pass on their own. Empty the table to
  // reproduce a database nobody has signed into yet — the state the route is
  // reachable in. Runs last: it invalidates every session above.
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

  // Tenants are provisioned from claims, so drop the ones this run made and the
  // next run starts where this one did.
  for (const doc of (await cms.find({ collection: 'tenants', limit: 100 })).docs) {
    await cms.delete({ id: doc.id, collection: 'tenants' })
  }

  console.log(process.exitCode ? '\n=== HTTP PROOF FAILED ===' : '\n=== HTTP PROOF COMPLETE ===')
  process.exit(process.exitCode || 0)
}

run().catch((e) => {
  console.error('HTTP PROOF FAILED:', e)
  process.exit(1)
})
