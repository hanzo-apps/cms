import type { SanitizedConfig } from '@hanzo/cms'

import fs from 'fs'
import { printSchema } from 'graphql'

import { configToSchema } from '../index.js'
export function generateSchema(config: SanitizedConfig): void {
  const outputFile = process.env.CMS_GRAPHQL_SCHEMA_PATH || config.graphQL.schemaOutputFile

  const { schema } = configToSchema(config)

  fs.writeFileSync(outputFile, printSchema(schema))
}
