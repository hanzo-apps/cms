import fs from 'fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const tgzToPkgNameMap = {
  payload: 'payload-*',
  '@hanzo/cms-admin-bar': 'payloadcms-admin-bar-*',
  '@hanzo/cms-db-mongodb': 'payloadcms-db-mongodb-*',
  '@hanzo/cms-db-postgres': 'payloadcms-db-postgres-*',
  '@hanzo/cms-db-vercel-postgres': 'payloadcms-db-vercel-postgres-*',
  '@hanzo/cms-db-sqlite': 'payloadcms-db-sqlite-*',
  '@hanzo/cms-db-d1-sqlite': 'payloadcms-db-d1-sqlite-*',
  '@hanzo/cms-drizzle': 'payloadcms-drizzle-*',
  '@hanzo/cms-email-nodemailer': 'payloadcms-email-nodemailer-*',
  '@hanzo/cms-email-resend': 'payloadcms-email-resend-*',
  '@hanzo/cms-eslint-config': 'payloadcms-eslint-config-*',
  '@hanzo/cms-eslint-plugin': 'payloadcms-eslint-plugin-*',
  '@hanzo/cms-figma': 'payloadcms-figma-*',
  '@hanzo/cms-graphql': 'payloadcms-graphql-*',
  '@hanzo/cms-live-preview': 'payloadcms-live-preview-*',
  '@hanzo/cms-live-preview-react': 'payloadcms-live-preview-react-*',
  '@hanzo/cms-kv-redis': 'payloadcms-kv-redis-*',
  '@hanzo/cms-next': 'payloadcms-next-*',
  '@hanzo/cms-payload-cloud': 'payloadcms-payload-cloud-*',
  '@hanzo/cms-plugin-cloud-storage': 'payloadcms-plugin-cloud-storage-*',
  '@hanzo/cms-plugin-form-builder': 'payloadcms-plugin-form-builder-*',
  '@hanzo/cms-plugin-ecommerce': 'payloadcms-plugin-ecommerce-*',
  '@hanzo/cms-plugin-import-export': 'payloadcms-plugin-import-export-*',
  '@hanzo/cms-plugin-mcp': 'payloadcms-plugin-mcp-*',
  '@hanzo/cms-plugin-multi-tenant': 'payloadcms-plugin-multi-tenant-*',
  '@hanzo/cms-plugin-nested-docs': 'payloadcms-plugin-nested-docs-*',
  '@hanzo/cms-plugin-redirects': 'payloadcms-plugin-redirects-*',
  '@hanzo/cms-plugin-search': 'payloadcms-plugin-search-*',
  '@hanzo/cms-plugin-sentry': 'payloadcms-plugin-sentry-*',
  '@hanzo/cms-plugin-seo': 'payloadcms-plugin-seo-*',
  '@hanzo/cms-richtext-lexical': 'payloadcms-richtext-lexical-*',
  '@hanzo/cms-richtext-slate': 'payloadcms-richtext-slate-*',
  '@hanzo/cms-sdk': 'payloadcms-sdk-*',
  '@hanzo/cms-storage-azure': 'payloadcms-storage-azure-*',
  '@hanzo/cms-storage-gcs': 'payloadcms-storage-gcs-*',
  '@hanzo/cms-storage-r2': 'payloadcms-storage-r2-*',
  '@hanzo/cms-storage-s3': 'payloadcms-storage-s3-*',
  '@hanzo/cms-storage-uploadthing': 'payloadcms-storage-uploadthing-*',
  '@hanzo/cms-storage-vercel-blob': 'payloadcms-storage-vercel-blob-*',
  '@hanzo/cms-translations': 'payloadcms-translations-*',
  '@hanzo/cms-ui': 'payloadcms-ui-*',
  '@hanzo/create-cms-app': '@hanzo/create-cms-app-*',
}

function findActualTgzName(pattern: string) {
  const packedDir = path.resolve(dirname, 'packed')
  const files = fs.readdirSync(packedDir)
  const matchingFile = files.find((file) => file.startsWith(pattern.replace('*', '')))
  return matchingFile ? `file:packed/${matchingFile}` : null
}

/**
 * This does the following:
 * - installs all packages from test/packed to test/package.json
 */
export function setupProd() {
  const packageJsonString = fs.readFileSync(path.resolve(dirname, 'package.json'), 'utf8')
  const packageJson = JSON.parse(packageJsonString)

  const allDependencies = {}
  // Go through all the dependencies and devDependencies, replace the normal package entry with the tgz entry
  for (const key of ['dependencies', 'devDependencies']) {
    const dependencies = packageJson[key]
    if (dependencies) {
      for (const [packageName, _packageVersion] of Object.entries(dependencies)) {
        if (tgzToPkgNameMap[packageName]) {
          const actualTgzPath = findActualTgzName(tgzToPkgNameMap[packageName])
          if (actualTgzPath) {
            dependencies[packageName] = actualTgzPath
            allDependencies[packageName] = actualTgzPath
          } else {
            console.warn(`Warning: No matching tgz found for ${packageName}`)
          }
        }
      }
    }
  }

  // now add them all to overrides and pnpm.overrides as well
  packageJson.pnpm = packageJson.pnpm || {}
  packageJson.pnpm.overrides = packageJson.pnpm.overrides || {}
  packageJson.overrides = packageJson.overrides || {}
  for (const [packageName, packageVersion] of Object.entries(allDependencies)) {
    packageJson.pnpm.overrides[packageName] = packageVersion
    packageJson.overrides[packageName] = packageVersion
  }

  // write it out
  fs.writeFileSync(path.resolve(dirname, 'package.json'), JSON.stringify(packageJson, null, 2))
}

setupProd()
