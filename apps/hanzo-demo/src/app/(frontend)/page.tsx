import { headers as getHeaders } from 'next/headers.js'
import { getCMS } from '@hanzo/cms'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

/**
 * The front of the deployment: what this CMS is currently publishing.
 *
 * It reads the `pages` collection rather than describing itself, because that is
 * the thing worth showing -- published documents are world-readable by design
 * (see Pages.access.read), so this renders for a signed-out visitor exactly as a
 * storefront would. An empty deployment says it is empty; it does not pretend
 * otherwise.
 */
export default async function HomePage() {
  const headers = await getHeaders()
  const cmsConfig = await config
  const cms = await getCMS({ config: cmsConfig })
  const { user } = await cms.auth({ headers })

  const { docs: pages } = await cms.find({
    collection: 'pages',
    depth: 0,
    limit: 20,
    sort: '-updatedAt',
    where: { _status: { equals: 'published' } },
  })

  return (
    <div className="home">
      <div className="content">
        {/* Served from this app's public/ dir. The page is always dark, so the
            mark is always the white one. */}
        <img alt="Hanzo" height={65} src="/icon-white.svg" width={65} />
        <h1>{user ? `Welcome back, ${user.email}` : 'Hanzo CMS'}</h1>

        {pages.length > 0 ? (
          <ul className="pages">
            {pages.map((page) => (
              <li key={page.id}>
                <a href={`/${page.slug ?? page.id}`}>{page.title}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nothing is published yet.</p>
        )}

        <div className="links">
          <a className="admin" href={cmsConfig.routes.admin}>
            Go to admin panel
          </a>
          <a className="docs" href="https://docs.hanzo.ai" rel="noopener noreferrer" target="_blank">
            Documentation
          </a>
        </div>
      </div>
    </div>
  )
}
