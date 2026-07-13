import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CMSRequest } from '@hanzo/cms'

import { toolSchemas } from '../schemas.js'

export const unlockTool = (server: McpServer, req: CMSRequest, verboseLogs: boolean) => {
  const tool = async (collection: string, email: string) => {
    const cms = req.cms

    if (verboseLogs) {
      cms.logger.info(
        `[cms-mcp] Unlocking user account for user: ${email} in collection: ${collection}`,
      )
    }

    try {
      const result = await cms.unlock({
        collection,
        data: {
          email,
        },
        overrideAccess: true,
      })

      if (verboseLogs) {
        cms.logger.info(`[cms-mcp] User account unlocked successfully for user: ${email}`)
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: `# User Account Unlocked\n\n**User:** ${email}\n**Collection:** ${collection}\n\n\`\`\`json\n${JSON.stringify(result)}\n\`\`\``,
          },
        ],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      cms.logger.error(
        `[cms-mcp] Error unlocking user account for user ${email}: ${errorMessage}`,
      )

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ **Error unlocking user account for user "${email}"**: ${errorMessage}`,
          },
        ],
      }
    }
  }

  server.registerTool(
    'unlock',
    {
      description: toolSchemas.unlock.description,
      inputSchema: toolSchemas.unlock.parameters.shape,
    },
    async ({ collection, email }) => {
      return await tool(collection, email)
    },
  )
}
