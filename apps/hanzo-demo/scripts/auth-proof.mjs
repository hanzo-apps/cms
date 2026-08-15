/**
 * Drives the real sign-in against the real IAM and photographs each step.
 *
 * A status code proves nothing here: the admin renders through server
 * components, so a refusal and a dashboard are both 200 to a plain fetch, and
 * the one interesting failure — the whole panel served to a caller who never
 * signed in — reads as success to curl. So this looks at the screen.
 *
 *   BASE=http://localhost:3000 \
 *   IAM_USER=z@hanzo.ai IAM_PASSWORD=… \
 *   node scripts/auth-proof.mjs
 *
 * Shots land in scripts/shots/.
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const BASE = process.env.BASE || 'http://localhost:3000'
const USER = process.env.IAM_USER
const PASSWORD = process.env.IAM_PASSWORD
const ORG = process.env.IAM_ORG || 'hanzo'

const SHOTS = join(dirname(fileURLToPath(import.meta.url)), 'shots')
mkdirSync(SHOTS, { recursive: true })

let failures = 0
const check = (passed, claim) => {
  console.log(`  ${passed ? '✓' : '✗'} ${claim}`)
  if (!passed) {
    failures += 1
  }
}

const shoot = async (page, name) => {
  const path = join(SHOTS, `${name}.png`)
  await page.screenshot({ fullPage: true, path })
  console.log(`    → ${path}`)
}

const run = async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { height: 900, width: 1440 } })
  const page = await context.newPage()

  console.log('\n=== anonymous ===')
  await page.goto(`${BASE}/admin`)
  // The admin redirects from a server component, which Next performs as a soft
  // navigation — no load event ever fires, so waiting on navigation waits
  // forever, and waiting on the network catches the "Redirecting…" frame. Wait
  // for the thing being asserted instead: the card itself.
  await page.getByRole('link', { name: /Sign in with Hanzo$/i }).waitFor({ timeout: 30000 })
  const anonURL = page.url()
  const anonBody = await page.locator('body').innerText()
  console.log(`  landed on ${anonURL}`)
  await shoot(page, '1-anonymous')

  // The dashboard names the collections it manages. Seeing them without a
  // session is the whole failure this step exists to catch.
  const leaked = /Collections|Dashboard/i.test(anonBody) && !/Sign in/i.test(anonBody)
  check(!leaked, 'an anonymous caller does NOT reach the dashboard')
  check(/Sign in with Hanzo/i.test(anonBody), 'the sign-in card is offered')

  if (!USER || !PASSWORD) {
    console.log('\n(IAM_USER / IAM_PASSWORD unset — stopping after the anonymous check)')
    await browser.close()
    process.exit(failures ? 1 : 0)
  }

  console.log('\n=== sign in ===')
  await page.getByRole('link', { name: /Sign in with Hanzo$/i }).click()
  await page.waitForURL(/hanzo\.id/, { timeout: 45000, waitUntil: 'commit' })
  console.log(`  handed to ${new URL(page.url()).origin}`)
  check(/hanzo\.id/.test(page.url()), 'the browser is handed to the identity provider')
  check(
    new URL(page.url()).searchParams.get('code_challenge_method') === 'S256' ||
      page.url().includes('code_challenge'),
    'the authorize request carries a PKCE challenge',
  )
  // The IdP is a single-page app: the first paint is "Loading…", and the form
  // arrives afterwards. Wait for the field, not for the navigation.
  await page.locator('input[type="password"]').waitFor({ state: 'visible', timeout: 45000 })
  await shoot(page, '2-idp')

  // The credential goes to IAM's login endpoint directly, carrying the authorize
  // request this browser actually started — same client, same redirect, same
  // state, same PKCE challenge.
  //
  // Not because driving the form would be better proof, but because the form
  // cannot be driven: it posts an EMPTY `organization` and IAM answers
  // "organization, username and password are required" for every application on
  // the issuer, a fully configured one included. That is a defect in the IdP's
  // own sign-in page and it is upstream of everything here. Going around it
  // keeps this a test of THIS codebase — the authorize request it builds, the
  // state it binds, the code it exchanges, the session it writes and the claims
  // it maps — rather than a test of somebody else's form.
  const authorize = new URL(page.url())
  const q = authorize.searchParams
  const login = await fetch(`${new URL(page.url()).origin}/v1/iam/login`, {
    body: JSON.stringify({
      application: q.get('client_id'),
      clientId: q.get('client_id'),
      codeChallenge: q.get('code_challenge'),
      codeChallengeMethod: q.get('code_challenge_method'),
      organization: ORG,
      password: PASSWORD,
      redirectUri: q.get('redirect_uri'),
      scope: q.get('scope'),
      state: q.get('state'),
      type: 'code',
      username: USER,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  }).then((r) => r.json())

  check(login.status === 'ok' && !!login.data, `IAM authenticated ${USER} (${login.msg || 'ok'})`)
  if (login.status !== 'ok') {
    await browser.close()
    process.exit(1)
  }

  // Back through OUR callback, in the same browser, carrying the cms-oauth cookie
  // that holds the verifier and the state this flow began with.
  await page.goto(`${BASE}/auth/callback?code=${login.data}&state=${q.get('state')}`)
  await page.waitForLoadState('networkidle')
  console.log(`  returned to ${page.url()}`)
  await shoot(page, '4-dashboard')

  const body = await page.locator('body').innerText()
  check(/\/admin/.test(page.url()), 'the browser lands back in the admin')
  check(!/Sign in with Hanzo/i.test(body), 'the sign-in card is gone')

  // Who is signed in, and in which tenant — read from the panel, not from a token.
  const cookies = await context.cookies()
  const token = cookies.find((c) => c.name === 'cms-token')
  const tenant = cookies.find((c) => c.name === 'cms-tenant')
  check(Boolean(token), 'the session cookie is cms-token')
  check(Boolean(token?.httpOnly), 'the session cookie is httpOnly')
  if (token) {
    const claims = JSON.parse(Buffer.from(token.value.split('.')[1], 'base64url').toString())
    console.log(
      `  token: iss=${claims.iss} aud=${JSON.stringify(claims.aud)} owner=${claims.owner} sub=${claims.sub?.slice(0, 12)}…`,
    )
    console.log(`  orgs: ${JSON.stringify(claims.orgs)}`)
    check(claims.iss?.includes('hanzo.id'), 'the session cookie holds an IAM-issued token')
    // The audience is what confines a session to THIS deployment: every client on
    // the issuer shares a signing key, so without it a token minted for any other
    // app would authenticate here.
    const addressed = [].concat(claims.aud ?? []).includes(q.get('client_id'))
    check(addressed, `the token is addressed to ${q.get('client_id')}, not to some other app`)
  }
  check(Boolean(tenant), 'a tenant is selected')
  // Secure, like the session cookie beside it. It is still stored here because
  // localhost is a trustworthy origin — the flag costs nothing in the dev loop
  // and is what keeps the selection off the wire everywhere else.
  check(Boolean(tenant?.secure), 'the tenant cookie is Secure')
  check(Boolean(tenant?.httpOnly), 'the tenant cookie is httpOnly')

  console.log('\n=== the panel knows who this is ===')
  await page.goto(`${BASE}/admin/account`, { waitUntil: 'networkidle' })
  await shoot(page, '5-account')
  const account = await page.locator('body').innerText()
  check(account.includes(USER), `the account screen names ${USER}`)

  // Tenancy comes from the token, not from a table somebody edited: every org in
  // the signed `orgs` claim is a tenant, and the row is rewritten on every
  // sign-in, so a membership that is gone upstream is gone here too.
  console.log('\n=== tenancy follows the claim ===')
  const claimed = JSON.parse(
    Buffer.from(token.value.split('.')[1], 'base64url').toString(),
  ).orgs?.map((o) => o.org)
  const tenants = await page
    .goto(`${BASE}/api/tenants?limit=100&depth=0`, { waitUntil: 'networkidle' })
    .then((r) => r.json())
  const slugs = (tenants.docs ?? []).map((d) => d.slug).sort()
  console.log(`  claim orgs : ${JSON.stringify(claimed?.slice().sort())}`)
  console.log(`  cms tenants: ${JSON.stringify(slugs)}`)
  check(
    claimed?.every((org) => slugs.includes(org)),
    'every org in the token became a tenant',
  )

  const me = await page
    .goto(`${BASE}/api/users/me`, { waitUntil: 'networkidle' })
    .then((r) => r.json())
  const mine = (me.user?.tenants ?? []).length
  console.log(`  user.tenants: ${mine}`)
  check(mine === claimed?.length, `the user carries all ${claimed?.length} tenants`)
  check(
    me.user?.iamOrg === ORG,
    `the home org is ${ORG} (isSuperAdmin reads this, not the orgs claim)`,
  )

  await browser.close()
  console.log(failures ? `\n${failures} check(s) FAILED` : '\nall checks passed')
  process.exit(failures ? 1 : 0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
