import type { CMSRequest } from '@hanzo/cms'

import { parseCookies } from '@hanzo/cms/shared'

import { isSuperAdmin } from './super.js'

/**
 * Whitespace, control, or zero-width/format runes — the class that defeats the
 * injectivity of the org→org map. Transport trimming silently drops these at the
 * edges, so two DISTINCT orgs ("acme" and "acme ", or an NBSP variant) would
 * collapse onto one. A selection carrying one is discarded. Case and visible
 * punctuation are deliberately NOT unsafe: they survive transport, so they stay
 * distinct. Mirrors the gateway's OrgHasUnsafeRune, so both sides of the trust
 * boundary refuse the same set.
 */
const hasUnsafeRune = (s: string): boolean => /[\s\p{Cc}\p{Cf}]/u.test(s)

const idsOf = (user: unknown): string[] =>
  ((user as { tenants?: { tenant?: unknown }[] } | null)?.tenants ?? [])
    .map((row) => {
      const tenant = row?.tenant
      if (typeof tenant === 'string' || typeof tenant === 'number') {
        return String(tenant)
      }
      if (tenant && typeof tenant === 'object' && 'id' in tenant) {
        return String((tenant as { id: unknown }).id)
      }
      return undefined
    })
    .filter(Boolean) as string[]

/**
 * The org a request ACTS IN — the value that scopes and pays for it.
 *
 * Two branches, the same two the gateway has:
 *
 *   - MASQUERADE (a platform operator, i.e. a member of the reserved `admin`
 *     org): the selection is honoured with no membership test. That is what
 *     platform sudo means.
 *   - EVERYONE ELSE: honoured iff the selection is one of the caller's own
 *     tenants. The home org is always implicitly theirs.
 *
 * A selection outside the set is DISCARDED, never refused: the request continues
 * in the home org, indistinguishable from no selection at all. So a stale switcher
 * choice left in a browser after a membership is revoked reads the caller's OWN
 * data — never the requested org's, and never a 403 the UI cannot explain.
 *
 * Membership is tested on the tenant ID, which is what the cookie carries and
 * what the user row holds; the slug is only ever read back OUT of the resolved
 * document. So a forged cookie names a document or names nothing — it cannot
 * assert an org that does not exist, and it cannot name one the caller lacks.
 */
export const activeOrg = async (req: CMSRequest): Promise<string> => {
  const home = (req.user as { iamOrg?: string } | null)?.iamOrg ?? ''
  const selectedID = parseCookies(req.headers).get('cms-tenant')
  if (!selectedID) {
    return home
  }

  const tenantsSlug = 'tenants'
  if (!req.cms.collections?.[tenantsSlug]) {
    return home
  }

  let slug: string | undefined
  try {
    const doc = await req.cms.findByID({
      id: selectedID,
      collection: tenantsSlug,
      depth: 0,
      overrideAccess: true,
    })
    slug = (doc as { slug?: string })?.slug
  } catch {
    // a cookie naming no document selects nothing
    return home
  }

  if (!slug || slug === home || hasUnsafeRune(slug)) {
    return home
  }
  if (isSuperAdmin(req.user)) {
    return slug
  }
  return idsOf(req.user).includes(String(selectedID)) ? slug : home
}
