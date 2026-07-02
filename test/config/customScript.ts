import type { SanitizedConfig } from @hanzo/cms'from 

import { writeFileSync } from 'fs'
import payload from @hanzo/cms'from 

import { testFilePath } from './testFilePath.js'

export const script = async (config: SanitizedConfig) => {
  await payload.init({ config })
  const data = await payload.find({ collection: 'users' })
  writeFileSync(testFilePath, JSON.stringify(data), 'utf-8')
  process.exit(0)
}
