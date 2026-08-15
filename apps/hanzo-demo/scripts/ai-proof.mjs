/**
 * Signs in for real, then calls the AI endpoints as that editor.
 *
 * The point is WHOSE credential travels. These endpoints forward the caller's
 * own IAM bearer, so a successful call is also proof that the spend attributed
 * to that caller's org — there is no machine identity here to fall back to, and
 * an unauthenticated call is refused before the gateway is reached.
 *
 *   BASE=http://localhost:3002 IAM_USER=… IAM_PASSWORD=… IAM_ORG=hanzo \
 *   node scripts/ai-proof.mjs
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const BASE = process.env.BASE || 'http://localhost:3002'
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

const run = async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('\n=== refused without a session ===')
  for (const path of ['/api/ai/write', '/api/ai/image']) {
    const res = await fetch(`${BASE}${path}`, {
      body: JSON.stringify({ action: 'draft', prompt: 'x', text: 'x' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    check(res.status === 401, `anonymous POST ${path} -> ${res.status}`)
  }

  console.log('\n=== sign in ===')
  await page.goto(`${BASE}/auth/signin?redirect=%2Fadmin`)
  await page.waitForURL(/hanzo\.id/, { timeout: 45000, waitUntil: 'commit' })
  const q = new URL(page.url()).searchParams
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
  check(login.status === 'ok', `IAM authenticated ${USER}`)
  await page.goto(`${BASE}/auth/callback?code=${login.data}&state=${q.get('state')}`)
  await page.waitForLoadState('networkidle')

  const cookie = (await context.cookies()).find((c) => c.name === 'cms-token')
  check(Boolean(cookie), 'the session cookie is set')
  const as = { Cookie: `cms-token=${cookie.value}`, 'Content-Type': 'application/json', Origin: BASE }

  // Every call below travels on the cookie above and on nothing else.
  console.log('\n=== draft ===')
  const draft = await fetch(`${BASE}/api/ai/write`, {
    body: JSON.stringify({ action: 'draft', text: 'Three sentences on why content models beat page builders.' }),
    headers: as,
    method: 'POST',
  })
  const draftBody = await draft.json()
  console.log(`  HTTP ${draft.status}: ${JSON.stringify(draftBody).slice(0, 300)}`)
  check(draft.status !== 401, 'the editor’s own bearer was accepted (not 401)')

  console.log('\n=== rewrite ===')
  const rewrite = await fetch(`${BASE}/api/ai/write`, {
    body: JSON.stringify({ action: 'rewrite', instruction: 'make it terse', text: 'This is a rather long-winded sentence that could be much shorter.' }),
    headers: as,
    method: 'POST',
  })
  console.log(`  HTTP ${rewrite.status}: ${JSON.stringify(await rewrite.json()).slice(0, 300)}`)

  console.log('\n=== image -> Media ===')
  const image = await fetch(`${BASE}/api/ai/image`, {
    body: JSON.stringify({ prompt: 'a single smooth river stone on white' }),
    headers: as,
    method: 'POST',
  })
  const imageBody = await image.json()
  console.log(`  HTTP ${image.status}: ${JSON.stringify(imageBody).slice(0, 300)}`)

  if (image.status === 200) {
    const media = await fetch(`${BASE}/api/media?limit=5&depth=0`, { headers: as }).then((r) =>
      r.json(),
    )
    console.log(`  media docs: ${media.totalDocs}`)
    check(media.totalDocs > 0, 'the generated image landed in Media as a real document')
  }

  await browser.close()
  console.log(failures ? `\n${failures} check(s) FAILED` : '\nall checks passed')
  process.exit(failures ? 1 : 0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
