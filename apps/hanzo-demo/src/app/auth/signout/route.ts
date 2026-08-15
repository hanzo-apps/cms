import { clearedTenantCookie, signOutURL } from '@hanzo/cms-auth-iam'
import { getCMS } from '@hanzo/cms'
import { generateExpiredCMSCookie } from '@hanzo/cms/shared'
import configPromise from '@payload-config'

import { serverURL } from '../shared.js'

/**
 * Sign out of both halves.
 *
 * Dropping the local cookie ends the CMS session and nothing else: IAM still
 * recognises the browser, so the next visit to /admin signs the same person
 * straight back in with no prompt, which reads as sign-out being broken. So the
 * local cookies go and the browser is then handed to IAM's own logout.
 */
export const GET = async (request: Request): Promise<Response> => {
  const cms = await getCMS({ config: configPromise })
  const authConfig = cms.config.collections.find(({ slug }) => slug === cms.config.admin.user)?.auth

  const headers = new Headers({
    Location: signOutURL({
      origin: serverURL(),
      returnPath: new URL(request.url).searchParams.get('return') ?? '/admin',
    }),
  })

  if (authConfig) {
    headers.append(
      'Set-Cookie',
      generateExpiredCMSCookie({
        collectionAuthConfig: authConfig,
        cookiePrefix: cms.config.cookiePrefix,
      }),
    )
  }
  headers.append('Set-Cookie', clearedTenantCookie())

  return new Response(null, { headers, status: 302 })
}
