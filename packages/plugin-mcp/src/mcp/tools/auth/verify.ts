import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CMSRequest } from '@hanzo/cms'

import { toolSchemas } from '../schemas.js'

export const verifyTool = (server: McpServer, req: CMSRequest, verboseLogs: boolean) => {
  const tool = async (collection: string, token: string) => {
    const cms = req.cms

    if (verboseLogs) {
      cms.logger.info(`[cms-mcp] Verifying user account for collection: ${collection}`)
    }

    try {
      const result = await cms.verifyEmail({
        collection,
        token,
      })

      if (verboseLogs) {
        cms.logger.info('[cms-mcp] Email verification completed successfully')
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: `# Email Verification Successful\n\n**Collection:** ${collection}\n**Token:** ${token}\n**Result:** ${result ? 'Success' : 'Failed'}`,
          },
        ],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      cms.logger.error(`[cms-mcp] Error verifying email: ${errorMessage}`)

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ **Error verifying email**: ${errorMessage}`,
          },
        ],
      }
    }
  }

  server.registerTool(
    'verify',
    {
      description: toolSchemas.verify.description,
      inputSchema: toolSchemas.verify.parameters.shape,
    },
    async ({ collection, token }) => {
      return await tool(collection, token)
    },
  )
}
