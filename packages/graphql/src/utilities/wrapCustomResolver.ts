import type { ObjMap } from 'graphql/jsutils/ObjMap.js'
import type { GraphQLFieldConfig, GraphQLFieldResolver } from 'graphql/type/definition.js'
import type { CMSRequest } from '@hanzo/cms'

import { isolateObjectProperty } from '@hanzo/cms'

type CMSContext = { req: CMSRequest }

function wrapCustomResolver<TSource, TArgs, TResult>(
  resolver: GraphQLFieldResolver<TSource, CMSContext, TArgs, TResult>,
): GraphQLFieldResolver<TSource, CMSContext, TArgs, TResult> {
  return (source, args, context, info) => {
    return resolver(
      source,
      args,
      { ...context, req: isolateObjectProperty(context.req, 'transactionID') },
      info,
    )
  }
}

export function wrapCustomFields<TSource>(
  fields: ObjMap<GraphQLFieldConfig<TSource, CMSContext>>,
): ObjMap<GraphQLFieldConfig<TSource, CMSContext>> {
  for (const key in fields) {
    if (fields[key].resolve) {
      fields[key].resolve = wrapCustomResolver(fields[key].resolve)
    }
  }
  return fields
}
