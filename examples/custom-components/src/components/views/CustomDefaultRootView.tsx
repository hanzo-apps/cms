import type { AdminViewProps } from '@hanzo/cms'

import { DefaultTemplate } from '@hanzo/cms-next/templates'
import { Gutter } from '@hanzo/cms-ui'
import React from 'react'

export const CustomDefaultRootView: React.FC<AdminViewProps> = ({
  initPageResult,
  params,
  searchParams,
}) => {
  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1>Custom Default Root View</h1>
        <br />
        <p>This view uses the Default Template.</p>
      </Gutter>
    </DefaultTemplate>
  )
}
