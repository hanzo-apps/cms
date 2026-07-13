import mongoose from 'mongoose'

import type { MongooseAdapter } from '../index.js'
import type { GlobalModel } from '../types.js'

import { getBuildQueryPlugin } from '../queries/getBuildQueryPlugin.js'
import { buildSchema } from './buildSchema.js'

export const buildGlobalModel = (adapter: MongooseAdapter): GlobalModel | null => {
  if (adapter.cms.config.globals && adapter.cms.config.globals.length > 0) {
    const globalsSchema = new mongoose.Schema(
      {},
      { discriminatorKey: 'globalType', minimize: false, timestamps: true },
    )

    globalsSchema.plugin(getBuildQueryPlugin())

    const Globals = adapter.connection.model(
      'globals',
      globalsSchema,
      'globals',
    ) as unknown as GlobalModel

    Object.values(adapter.cms.config.globals).forEach((globalConfig) => {
      const globalSchema = buildSchema({
        buildSchemaOptions: {
          options: {
            minimize: false,
          },
        },
        configFields: globalConfig.fields,
        cms: adapter.cms,
      })
      Globals.discriminator(globalConfig.slug, globalSchema)
    })

    return Globals
  }

  return null
}
