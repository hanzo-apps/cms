/* eslint-disable no-console */
import fs from 'fs/promises'
import process from 'node:process'

import type { CMSComponent, SanitizedConfig } from '../../config/types.js'

import { iterateConfig } from './iterateConfig.js'
import { addCMSComponentToImportMap } from './utilities/addPayloadComponentToImportMap.js'
import { getImportMapToBaseDirPath } from './utilities/getImportMapToBaseDirPath.js'
import { resolveImportMapFilePath } from './utilities/resolveImportMapFilePath.js'

type ImportIdentifier = string
type ImportSpecifier = string
type ImportPath = string
type UserImportPath = string

/**
 * Import Map before being written to the file. Only contains all paths
 */
export type InternalImportMap = {
  [path: UserImportPath]: ImportIdentifier
}

/**
 * Imports of the import map.
 */
export type Imports = {
  [identifier: ImportIdentifier]: {
    path: ImportPath
    specifier: ImportSpecifier
  }
}

/**
 * Import Map after being imported from the actual import map. Contains all the actual imported components
 */
export type ImportMap = {
  [path: UserImportPath]: any
}

export type AddToImportMap = (cmsComponent?: CMSComponent | CMSComponent[]) => void

export async function generateImportMap(
  config: SanitizedConfig,
  options?: {
    force?: boolean /**
     * If true, will not throw an error if the import map file path cannot be resolved
    Instead, it will return silently.
     */
    ignoreResolveError?: boolean
    log: boolean
  },
): Promise<void> {
  const shouldLog = options?.log ?? true

  if (shouldLog) {
    console.log('Generating import map')
  }

  const importMap: InternalImportMap = {}
  const imports: Imports = {}

  // Determine the root directory of the project - usually the directory where the src or app folder is located
  const rootDir = process.env.ROOT_DIR ?? process.cwd()

  const baseDir = config.admin.importMap.baseDir ?? process.cwd()

  const importMapFilePath = await resolveImportMapFilePath({
    adminRoute: config.routes.admin,
    importMapFile: config?.admin?.importMap?.importMapFile,
    rootDir,
  })

  if (importMapFilePath instanceof Error) {
    if (options?.ignoreResolveError) {
      return
    } else {
      throw importMapFilePath
    }
  }

  const importMapToBaseDirPath = getImportMapToBaseDirPath({
    baseDir,
    importMapPath: importMapFilePath,
  })

  const addToImportMap: AddToImportMap = (cmsComponent) => {
    if (!cmsComponent) {
      return
    }

    if (typeof cmsComponent !== 'object' && typeof cmsComponent !== 'string') {
      console.error(cmsComponent)
      throw new Error('addToImportMap > CMS component must be an object or a string')
    }

    if (Array.isArray(cmsComponent)) {
      for (const component of cmsComponent) {
        addCMSComponentToImportMap({
          importMap,
          importMapToBaseDirPath,
          imports,
          cmsComponent: component,
        })
      }
    } else {
      addCMSComponentToImportMap({
        importMap,
        importMapToBaseDirPath,
        imports,
        cmsComponent,
      })
    }
  }

  iterateConfig({
    addToImportMap,
    baseDir: config.admin.importMap.baseDir,
    config,
    importMap,
    imports,
  })

  await writeImportMap({
    componentMap: importMap,
    force: options?.force,
    importMap: imports,
    importMapFilePath,
    log: shouldLog,
  })
}

export async function writeImportMap({
  componentMap,
  force,
  importMap,
  importMapFilePath,
  log,
}: {
  componentMap: InternalImportMap
  force?: boolean
  importMap: Imports
  importMapFilePath: string
  log?: boolean
}) {
  const imports: string[] = []
  for (const [identifier, { path, specifier }] of Object.entries(importMap)) {
    imports.push(`import { ${specifier} as ${identifier} } from '${path}'`)
  }

  const mapKeys: string[] = []
  for (const [userPath, identifier] of Object.entries(componentMap)) {
    mapKeys.push(`  "${userPath}": ${identifier}`)
  }

  const importMapOutputFile = `${imports.join('\n')}

/** @type import('@hanzo/cms'import().ImportMap */
export const importMap = {
${mapKeys.join(',\n')}
}
`

  if (!force) {
    // Read current import map and check in the IMPORTS if there are any new imports. If not, don't write the file.
    const currentImportMap = await fs.readFile(importMapFilePath, 'utf-8')

    if (currentImportMap?.trim() === importMapOutputFile?.trim()) {
      if (log) {
        console.log('No new imports found, skipping writing import map')
      }
      return
    }
  }

  if (log) {
    console.log('Writing import map to', importMapFilePath)
  }

  await fs.writeFile(importMapFilePath, importMapOutputFile)
}
