import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CMSRequest } from '@hanzo/cms'

import { toolSchemas } from '../schemas.js'

export const loginTool = (server: McpServer, req: CMSRequest, verboseLogs: boolean) => {
  const tool = async (
    collection: string,
    email: string,
    password: string,
    depth: number = 0,
    overrideAccess: boolean = false,
    showHiddenFields: boolean = false,
  ) => {
    const cms = req.cms

    if (verboseLogs) {
      cms.logger.info(
        `[cms-mcp] Attempting login for user: ${email} in collection: ${collection}`,
      )
    }

    try {
      const result = await cms.login({
        collection,
        data: {
          email,
          password,
        },
        depth,
        overrideAccess,
        showHiddenFields,
      })

      if (verboseLogs) {
        cms.logger.info(`[cms-mcp] Login successful for user: ${email}`)
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: `# Login Successful\n\n**User:** ${email}\n**Collection:** ${collection}\n\n\`\`\`json\n${JSON.stringify(result)}\n\`\`\``,
          },
        ],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      cms.logger.error(`[cms-mcp] Login failed for user ${email}: ${errorMessage}`)

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ **Login failed for user "${email}"**: ${errorMessage}`,
          },
        ],
      }
    }
  }

  server.registerTool(
    'login',
    {
      description: toolSchemas.login.description,
      inputSchema: toolSchemas.login.parameters.shape,
    },
    async ({ collection, depth, email, overrideAccess, password, showHiddenFields }) => {
      return await tool(collection, email, password, depth, overrideAccess, showHiddenFields)
    },
  )
}
