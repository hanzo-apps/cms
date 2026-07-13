import crypto from 'crypto'
import path from 'path'

import type { CMSComponent } from '../../../config/types.js'
import type { Imports, InternalImportMap } from '../index.js'

import { parseCMSComponent } from './parsePayloadComponent.js'

/**
 * Normalizes the component path based on the import map's base directory path.
 */
function getAdjustedComponentPath(importMapToBaseDirPath: string, componentPath: string): string {
  // Normalize input paths to use forward slashes
  const normalizedBasePath = importMapToBaseDirPath.replace(/\\/g, '/')
  const normalizedComponentPath = componentPath.replace(/\\/g, '/')

  // Base path starts with './' - preserve the './' prefix
  // => import map is in a subdirectory of the base directory, or in the same directory as the base directory
  if (normalizedBasePath.startsWith('./')) {
    // Remove './' from component path if it exists
    const cleanComponentPath = normalizedComponentPath.startsWith('./')
      ? normalizedComponentPath.substring(2)
      : normalizedComponentPath

    // Join the paths to preserve the './' prefix
    return `${normalizedBasePath}${cleanComponentPath}`
  }

  return path.posix.join(normalizedBasePath, normalizedComponentPath)
}

/**
 * Adds a cms component to the import map.
 */
export function addCMSComponentToImportMap({
  importMap,
  importMapToBaseDirPath,
  imports,
  cmsComponent,
}: {
  importMap: InternalImportMap
  importMapToBaseDirPath: string
  imports: Imports
  cmsComponent: CMSComponent
}): {
  path: string
  specifier: string
} | null {
  if (!cmsComponent) {
    return null
  }
  const { exportName, path: componentPath } = parseCMSComponent(cmsComponent)

  if (importMap[componentPath + '#' + exportName]) {
    return null
  }

  const importIdentifier =
    exportName + '_' + crypto.createHash('md5').update(componentPath).digest('hex')

  importMap[componentPath + '#' + exportName] = importIdentifier

  const isRelativePath = componentPath.startsWith('.') || componentPath.startsWith('/')

  if (isRelativePath) {
    const adjustedComponentPath = getAdjustedComponentPath(importMapToBaseDirPath, componentPath)

    imports[importIdentifier] = {
      path: adjustedComponentPath,
      specifier: exportName,
    }
    return {
      path: adjustedComponentPath,
      specifier: exportName,
    }
  } else {
    // Tsconfig alias or package import, e.g. '@hanzo/cms-ui' or '@/components/MyComponent'
    imports[importIdentifier] = {
      path: componentPath,
      specifier: exportName,
    }
    return {
      path: componentPath,
      specifier: exportName,
    }
  }
}
