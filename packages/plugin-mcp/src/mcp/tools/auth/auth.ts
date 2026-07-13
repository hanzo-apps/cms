import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CMSRequest } from '@hanzo/cms'

import { toolSchemas } from '../schemas.js'

export const authTool = (server: McpServer, req: CMSRequest, verboseLogs: boolean) => {
  const tool = async (headers?: string) => {
    const cms = req.cms

    if (verboseLogs) {
      cms.logger.info('[cms-mcp] Checking authentication status')
    }

    try {
      // Parse custom headers if provided, otherwise use empty headers
      let authHeaders = new Headers()

      if (headers) {
        try {
          const parsedHeaders = JSON.parse(headers)
          authHeaders = new Headers(parsedHeaders)
          if (verboseLogs) {
            cms.logger.info(`[cms-mcp] Using custom headers: ${headers}`)
          }
        } catch (_ignore) {
          cms.logger.warn(`[cms-mcp] Invalid headers JSON: ${headers}, using empty headers`)
        }
      }

      const result = await cms.auth({
        headers: authHeaders,
      })

      if (verboseLogs) {
        cms.logger.info('[cms-mcp] Authentication check completed successfully')
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: `# Authentication Status\n\n\`\`\`json\n${JSON.stringify(result)}\n\`\`\``,
          },
        ],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      cms.logger.error(`[cms-mcp] Error checking authentication: ${errorMessage}`)

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ **Error checking authentication**: ${errorMessage}`,
          },
        ],
      }
    }
  }

  server.registerTool(
    'auth',
    {
      description: toolSchemas.auth.description,
      inputSchema: toolSchemas.auth.parameters.shape,
    },
    async ({ headers }) => {
      return await tool(headers)
    },
  )
}
