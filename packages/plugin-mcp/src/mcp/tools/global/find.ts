import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CMSRequest, SelectType, TypedUser } from '@hanzo/cms'

import type { MCPPluginConfig } from '../../../types.js'

import { toCamelCase } from '../../../utils/camelCase.js'
import { toolSchemas } from '../schemas.js'

export const findGlobalTool = (
  server: McpServer,
  req: CMSRequest,
  user: TypedUser,
  verboseLogs: boolean,
  globalSlug: string,
  globals: MCPPluginConfig['globals'],
) => {
  const tool = async (
    depth: number = 0,
    locale?: string,
    fallbackLocale?: string,
    select?: string,
  ): Promise<{
    content: Array<{
      text: string
      type: 'text'
    }>
  }> => {
    const cms = req.cms

    if (verboseLogs) {
      cms.logger.info(
        `[cms-mcp] Reading global: ${globalSlug}, depth: ${depth}${locale ? `, locale: ${locale}` : ''}`,
      )
    }

    try {
      const findOptions: Parameters<typeof cms.findGlobal>[0] = {
        slug: globalSlug,
        depth,
        user,
      }

      let selectClause: SelectType | undefined
      if (select) {
        try {
          selectClause = JSON.parse(select) as SelectType
        } catch (_parseError) {
          cms.logger.warn(`[cms-mcp] Invalid select clause JSON for global: ${select}`)
          const response = {
            content: [{ type: 'text' as const, text: 'Error: Invalid JSON in select clause' }],
          }
          return (globals?.[globalSlug]?.overrideResponse?.(response, {}, req) || response) as {
            content: Array<{
              text: string
              type: 'text'
            }>
          }
        }
      }

      // Add locale parameters if provided
      if (locale) {
        findOptions.locale = locale
      }
      if (fallbackLocale) {
        findOptions.fallbackLocale = fallbackLocale
      }
      if (selectClause) {
        findOptions.select = selectClause
      }

      const result = await cms.findGlobal(findOptions)

      if (verboseLogs) {
        cms.logger.info(`[cms-mcp] Found global: ${globalSlug}`)
      }

      const response = {
        content: [
          {
            type: 'text' as const,
            text: `Global "${globalSlug}":
\`\`\`json
${JSON.stringify(result)}
\`\`\``,
          },
        ],
      }

      return (globals?.[globalSlug]?.overrideResponse?.(response, result, req) || response) as {
        content: Array<{
          text: string
          type: 'text'
        }>
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      cms.logger.error(`[cms-mcp] Error reading global ${globalSlug}: ${errorMessage}`)
      const response = {
        content: [
          {
            type: 'text' as const,
            text: `❌ **Error reading global "${globalSlug}":** ${errorMessage}`,
          },
        ],
      }
      return (globals?.[globalSlug]?.overrideResponse?.(response, {}, req) || response) as {
        content: Array<{
          text: string
          type: 'text'
        }>
      }
    }
  }

  if (globals?.[globalSlug]?.enabled) {
    server.registerTool(
      `find${globalSlug.charAt(0).toUpperCase() + toCamelCase(globalSlug).slice(1)}`,
      {
        description: `${toolSchemas.findGlobal.description.trim()}\n\n${globals?.[globalSlug]?.description || ''}`,
        inputSchema: toolSchemas.findGlobal.parameters.shape,
      },
      async ({ depth, fallbackLocale, locale, select }) => {
        return await tool(depth, locale, fallbackLocale, select)
      },
    )
  }
}
