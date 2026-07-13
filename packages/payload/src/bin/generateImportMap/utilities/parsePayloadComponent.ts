import type { CMSComponent } from '../../../config/types.js'

export function parseCMSComponent(CMSComponent: CMSComponent): {
  exportName: string
  path: string
} {
  if (!CMSComponent) {
    return null!
  }

  const pathAndMaybeExport =
    typeof CMSComponent === 'string' ? CMSComponent : CMSComponent.path

  let path: string
  let exportName: string

  if (pathAndMaybeExport.includes('#')) {
    ;[path, exportName] = pathAndMaybeExport.split('#', 2) as [string, string]
  } else {
    path = pathAndMaybeExport
    exportName = 'default'
  }

  if (typeof CMSComponent === 'object' && CMSComponent.exportName) {
    exportName = CMSComponent.exportName
  }

  return { exportName, path }
}
