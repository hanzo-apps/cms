import type { CMSRequest, VisibleEntities } from '@hanzo/cms'

type Hidden = ((args: { user: unknown }) => boolean) | boolean

function isHidden(hidden: Hidden | undefined, user: unknown): boolean {
  if (typeof hidden === 'function') {
    try {
      return hidden({ user })
    } catch {
      return true
    }
  }
  return !!hidden
}

export function getVisibleEntities({ req }: { req: CMSRequest }): VisibleEntities {
  return {
    collections: req.cms.config.collections
      .map(({ slug, admin: { hidden } }) => (!isHidden(hidden, req.user) ? slug : null))
      .filter(Boolean),
    globals: req.cms.config.globals
      .map(({ slug, admin: { hidden } }) => (!isHidden(hidden, req.user) ? slug : null))
      .filter(Boolean),
  }
}
