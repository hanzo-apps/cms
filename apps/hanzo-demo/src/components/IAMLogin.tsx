import type { AdminViewServerProps } from '@hanzo/cms'

import { getSafeRedirect } from '@hanzo/cms/shared'
import { redirect } from 'next/navigation.js'
import React from 'react'

import { HanzoLogo } from './HanzoLogo.js'

/**
 * The login screen. One card, one action: hand the browser to Hanzo IAM.
 *
 * A link and not an automatic bounce. An auto-redirect would turn any failure on
 * the way back — a refused authorization, an expired pending request — into a
 * loop between this page and the IdP, with the reason never on screen long enough
 * to read. A person clicking a button can also read the error above it.
 *
 * The second door is the same door with a different client. IAM will not mint a
 * platform operator through the tenant app, so an operator needs the reserved-org
 * client; that is IAM's rule, and it is why there are two links rather than one.
 */
export function IAMLogin({ initPageResult, searchParams }: AdminViewServerProps) {
  const { req } = initPageResult
  const {
    cms: { config },
    user,
  } = req

  const target = getSafeRedirect({
    fallbackTo: config.routes.admin,
    redirectTo: searchParams?.redirect ?? '',
  })

  if (user) {
    redirect(target)
  }

  const signin = `/auth/signin?redirect=${encodeURIComponent(target)}`

  return (
    <div className="iam-login">
      <div className="iam-login__mark">
        <HanzoLogo />
      </div>
      <h1 className="iam-login__title">Hanzo CMS</h1>
      <p className="iam-login__lede">Content for the Hanzo platform.</p>

      {searchParams?.error === 'auth' && (
        <p className="iam-login__alert" role="alert">
          Sign-in did not complete. Try again.
        </p>
      )}

      <a className="iam-login__action" href={signin}>
        Sign in with Hanzo
      </a>
      <a className="iam-login__alt" href={`${signin}&org=admin`}>
        Sign in as platform admin
      </a>
    </div>
  )
}
