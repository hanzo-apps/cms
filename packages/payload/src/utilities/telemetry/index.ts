import { execSync } from 'child_process'
import ciInfo from 'ci-info'
import { randomBytes } from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import type { CMS } from '../../types/index.js'
import type { AdminInitEvent } from './events/adminInit.js'
import type { ServerInitEvent } from './events/serverInit.js'

import { findUp } from '../findUp.js'
import { Conf } from './conf/index.js'
import { oneWayHash } from './oneWayHash.js'

export type BaseEvent = {
  ciName: null | string
  dbAdapter: string
  emailAdapter: null | string
  envID: string
  isCI: boolean
  locales: string[]
  localizationDefaultLocale: null | string
  localizationEnabled: boolean
  nodeEnv: string
  nodeVersion: string
  cmsVersion: string
  projectID: string
  projectIDSource: 'cwd' | 'git' | 'packageJSON' | 'serverURL'
  uploadAdapters: string[]
}

type PackageJSON = {
  dependencies: Record<string, string | undefined>
  name: string
}

type TelemetryEvent = AdminInitEvent | ServerInitEvent

type Args = {
  event: TelemetryEvent
  cms: CMS
}

let baseEvent: BaseEvent | null = null

export const sendEvent = async ({ event, cms }: Args): Promise<void> => {
  // Hanzo CMS: no phone-home. Telemetry is fully disabled — this fork never
  // sends events to any external endpoint. Set CMS_TELEMETRY_DEBUG to log
  // locally what a build of upstream CMS would otherwise have transmitted.
  if (!process.env.CMS_TELEMETRY_DEBUG) {
    return
  }
  try {
    if (cms.config.telemetry !== false) {
      const { packageJSON, packageJSONPath } = await getPackageJSON()

      // Only generate the base event once
      if (!baseEvent) {
        const { projectID, source: projectIDSource } = getProjectID(cms, packageJSON!)
        baseEvent = {
          ciName: ciInfo.isCI ? ciInfo.name : null,
          envID: getEnvID(),
          isCI: ciInfo.isCI,
          nodeEnv: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
          cmsVersion: getCMSVersion(packageJSON!),
          projectID,
          projectIDSource,
          ...getLocalizationInfo(cms),
          dbAdapter: cms.db.name,
          emailAdapter: cms.email?.name || null,
          uploadAdapters: cms.config.upload.adapters,
        }
      }

      cms.logger.info({
        event: { ...baseEvent, ...event, packageJSONPath },
        msg: 'Telemetry Event (local only — Hanzo CMS never transmits)',
      })
    }
  } catch (_) {
    // Eat any errors in sending telemetry event
  }
}

/**
 * This is a quasi-persistent identifier used to dedupe recurring events. It's
 * generated from random data and completely anonymous.
 */
const getEnvID = (): string => {
  const conf = new Conf()
  const ENV_ID = 'envID'

  const val = conf.get(ENV_ID)
  if (val) {
    return val as string
  }

  const generated = randomBytes(32).toString('hex')
  conf.set(ENV_ID, generated)
  return generated
}

const getProjectID = (
  cms: CMS,
  packageJSON: PackageJSON,
): { projectID: string; source: BaseEvent['projectIDSource'] } => {
  const gitID = getGitID(cms)
  if (gitID) {
    return { projectID: oneWayHash(gitID, cms.secret), source: 'git' }
  }

  const packageJSONID = getPackageJSONID(cms, packageJSON)
  if (packageJSONID) {
    return { projectID: oneWayHash(packageJSONID, cms.secret), source: 'packageJSON' }
  }

  const serverURL = cms.config.serverURL
  if (serverURL) {
    return { projectID: oneWayHash(serverURL, cms.secret), source: 'serverURL' }
  }

  const cwd = process.cwd()
  return { projectID: oneWayHash(cwd, cms.secret), source: 'cwd' }
}

const getGitID = (cms: CMS) => {
  try {
    const originBuffer = execSync('git config --local --get remote.origin.url', {
      stdio: 'pipe',
      timeout: 1000,
    })

    return oneWayHash(String(originBuffer).trim(), cms.secret)
  } catch (_) {
    return null
  }
}

const getPackageJSON = async (): Promise<{
  packageJSON?: PackageJSON
  packageJSONPath: string
}> => {
  let packageJSONPath = path.resolve(process.cwd(), 'package.json')

  if (!fs.existsSync(packageJSONPath)) {
    // Old logic
    const filename = fileURLToPath(import.meta.url)
    const dirname = path.dirname(filename)
    packageJSONPath = (await findUp({
      dir: dirname,
      fileNames: ['package.json'],
    }))!
  }

  const jsonContentString = await fs.promises.readFile(packageJSONPath, 'utf-8')
  const jsonContent: PackageJSON = JSON.parse(jsonContentString)
  return { packageJSON: jsonContent, packageJSONPath }
}

const getPackageJSONID = (cms: CMS, packageJSON: PackageJSON): string => {
  return oneWayHash(packageJSON.name, cms.secret)
}

export const getCMSVersion = (packageJSON: PackageJSON): string => {
  return packageJSON?.dependencies?.cms ?? ''
}

export const getLocalizationInfo = (
  cms: CMS,
): Pick<BaseEvent, 'locales' | 'localizationDefaultLocale' | 'localizationEnabled'> => {
  if (!cms.config.localization) {
    return {
      locales: [],
      localizationDefaultLocale: null,
      localizationEnabled: false,
    }
  }

  return {
    locales: cms.config.localization.localeCodes,
    localizationDefaultLocale: cms.config.localization.defaultLocale,
    localizationEnabled: true,
  }
}
