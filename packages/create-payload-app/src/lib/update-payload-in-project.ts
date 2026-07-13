import fse from 'fs-extra'
import { fileURLToPath } from 'node:url'
import path from 'path'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import type { NextAppDetails } from '../types.js'

import { copyRecursiveSync } from '../utils/copy-recursive-sync.js'
import { getLatestPackageVersion } from '../utils/getLatestPackageVersion.js'
import { info } from '../utils/log.js'
import { getPackageManager } from './get-package-manager.js'
import { installPackages } from './install-packages.js'

export async function updateCMSInProject(
  appDetails: NextAppDetails,
): Promise<{ message: string; success: boolean }> {
  if (!appDetails.nextConfigPath) {
    return { message: 'No Next.js config found', success: false }
  }

  const projectDir = path.dirname(appDetails.nextConfigPath)

  const packageObj = (await fse.readJson(path.resolve(projectDir, 'package.json'))) as {
    dependencies?: Record<string, string>
  }
  if (!packageObj?.dependencies) {
    throw new Error('No package.json found in this project')
  }

  const cmsVersion = packageObj.dependencies?.payload
  if (!cmsVersion) {
    throw new Error('CMS is not installed in this project')
  }

  const packageManager = await getPackageManager({ projectDir })

  // Fetch latest CMS version
  const latestCMSVersion = await getLatestPackageVersion({ packageName: 'payload' })

  if (cmsVersion === latestCMSVersion) {
    return { message: `CMS v${cmsVersion} is already up to date.`, success: true }
  }

  // Update all existing CMS packages
  const cmsPackages = Object.keys(packageObj.dependencies).filter((dep) =>
    dep.startsWith('@hanzo/cms-'),
  )

  const packageNames = ['@hanzo/cms', ...cmsPackages]

  const packagesToUpdate = packageNames.map((pkg) => `${pkg}@${latestCMSVersion}`)

  info(`Using ${packageManager}.\n`)
  info(
    `Updating ${packagesToUpdate.length} CMS packages to v${latestCMSVersion}...\n\n${packageNames.map((p) => `  - ${p}`).join('\n')}`,
  )

  const { success: updateSuccess } = await installPackages({
    packageManager,
    packagesToInstall: packagesToUpdate,
    projectDir,
  })

  if (!updateSuccess) {
    throw new Error('Failed to update CMS packages')
  }
  info('CMS packages updated successfully.')

  info(`Updating CMS Next.js files...`)

  const templateFilesPath =
    process.env.JEST_WORKER_ID !== undefined
      ? path.resolve(dirname, '../../../../templates/blank')
      : path.resolve(dirname, '../..', 'dist/template')

  const templateSrcDir = path.resolve(templateFilesPath, 'src/app/(payload)')

  copyRecursiveSync(
    templateSrcDir,
    path.resolve(projectDir, appDetails.isSrcDir ? 'src/app' : 'app', '(payload)'),
    ['custom.scss$'], // Do not overwrite user's custom.scss
  )

  return { message: 'CMS updated successfully.', success: true }
}
