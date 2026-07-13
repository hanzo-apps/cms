import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CMSRequest } from '@hanzo/cms'

import { toolSchemas } from '../schemas.js'

export const resetPasswordTool = (server: McpServer, req: CMSRequest, verboseLogs: boolean) => {
  const tool = async (collection: string, token: string, password: string) => {
    const cms = req.cms

    if (verboseLogs) {
      cms.logger.info(`[cms-mcp] Resetting password for user in collection: ${collection}`)
    }

    try {
      const result = await cms.resetPassword({
        collection,
        data: {
          password,
          token,
        },
        overrideAccess: true,
      })

      if (verboseLogs) {
        cms.logger.info('[cms-mcp] Password reset completed successfully')
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: `# Password Reset Successful\n\n**Collection:** ${collection}\n**Token:** ${token}\n\n\`\`\`json\n${JSON.stringify(result)}\n\`\`\``,
          },
        ],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      cms.logger.error(`[cms-mcp] Error resetting password: ${errorMessage}`)

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ **Error resetting password**: ${errorMessage}`,
          },
        ],
      }
    }
  }

  server.registerTool(
    'resetPassword',
    {
      description: toolSchemas.resetPassword.description,
      inputSchema: toolSchemas.resetPassword.parameters.shape,
    },
    async ({ collection, password, token }) => {
      return await tool(collection, token, password)
    },
  )
}
