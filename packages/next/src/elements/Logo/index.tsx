import type { ServerProps } from '@hanzo/cms'
import type React from 'react'

import { RenderServerComponent } from '@hanzo/cms-ui/elements/RenderServerComponent'
import { CMSLogo } from '@hanzo/cms-ui/shared'

export const Logo: React.FC<ServerProps> = (props) => {
  const { i18n, locale, params, cms, permissions, searchParams, user } = props

  const {
    admin: {
      components: {
        graphics: { Logo: CustomLogo } = {
          Logo: undefined,
        },
      } = {},
    } = {},
  } = cms.config

  return RenderServerComponent({
    Component: CustomLogo,
    Fallback: CMSLogo,
    importMap: cms.importMap,
    serverProps: {
      i18n,
      locale,
      params,
      cms,
      permissions,
      searchParams,
      user,
    },
  })
}
