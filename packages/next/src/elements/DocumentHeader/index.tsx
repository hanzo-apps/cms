import type {
  CMSRequest,
  SanitizedCollectionConfig,
  SanitizedGlobalConfig,
  SanitizedPermissions,
} from '@hanzo/cms'

import { Gutter, RenderTitle } from '@hanzo/cms-ui'
import React from 'react'

import { DocumentTabs } from './Tabs/index.js'
import './index.scss'

const baseClass = `doc-header`

/**
 * @internal
 */
export const DocumentHeader: React.FC<{
  AfterHeader?: React.ReactNode
  collectionConfig?: SanitizedCollectionConfig
  globalConfig?: SanitizedGlobalConfig
  hideTabs?: boolean
  permissions: SanitizedPermissions
  req: CMSRequest
}> = (props) => {
  const { AfterHeader, collectionConfig, globalConfig, hideTabs, permissions, req } = props

  return (
    <Gutter className={baseClass}>
      <div className={`${baseClass}__header`}>
        <RenderTitle className={`${baseClass}__title`} />
        {!hideTabs && (
          <DocumentTabs
            collectionConfig={collectionConfig}
            globalConfig={globalConfig}
            permissions={permissions}
            req={req}
          />
        )}
      </div>
      {AfterHeader ? <div className={`${baseClass}__after-header`}>{AfterHeader}</div> : null}
    </Gutter>
  )
}
