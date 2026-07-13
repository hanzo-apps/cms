import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CMSRequest } from '@hanzo/cms'

import { readFileSync, statSync } from 'fs'

import { toolSchemas } from '../schemas.js'

export const readConfigFile = (
  req: CMSRequest,
  verboseLogs: boolean,
  configFilePath: string,
  includeMetadata: boolean = false,
) => {
  const cms = req.cms
  if (verboseLogs) {
    cms.logger.info(`[cms-mcp] Reading config file, includeMetadata: ${includeMetadata}`)
  }

  try {
    // Security check: ensure we're working with the specified config file
    if (!configFilePath.startsWith(process.cwd()) && !configFilePath.startsWith('/')) {
      cms.logger.error(`[cms-mcp] Invalid config path attempted: ${configFilePath}`)
      return {
        content: [
          {
            type: 'text' as const,
            text: '❌ **Error**: Invalid config path',
          },
        ],
      }
    }

    const content = readFileSync(configFilePath, 'utf8')
    const stats = statSync(configFilePath)

    if (verboseLogs) {
      cms.logger.info(`[cms-mcp] Successfully read config file. Size: ${stats.size} bytes`)
    }

    let responseText = `# CMS Configuration

**File**: \`${configFilePath}\``

    if (includeMetadata) {
      responseText += `
**Size**: ${stats.size.toLocaleString()} bytes
**Modified**: ${stats.mtime.toISOString()}
**Created**: ${stats.birthtime.toISOString()}`
    }

    responseText += `
---

**Configuration Content:**
\`\`\`typescript
${content}
\`\`\``

    return {
      content: [
        {
          type: 'text' as const,
          text: responseText,
        },
      ],
    }
  } catch (error) {
    const errorMessage = (error as Error).message
    cms.logger.error(`[cms-mcp] Error reading config file: ${errorMessage}`)
    return {
      content: [
        {
          type: 'text' as const,
          text: `❌ **Error reading config file**: ${errorMessage}`,
        },
      ],
    }
  }
}

// MCP Server tool registration
export const findConfigTool = (
  server: McpServer,
  req: CMSRequest,
  verboseLogs: boolean,
  configFilePath: string,
) => {
  const tool = (includeMetadata: boolean = false) => {
    const cms = req.cms

    if (verboseLogs) {
      cms.logger.info(`[cms-mcp] Finding config, includeMetadata: ${includeMetadata}`)
    }

    try {
      const result = readConfigFile(req, verboseLogs, configFilePath, includeMetadata)

      if (verboseLogs) {
        cms.logger.info(`[cms-mcp] Config search completed`)
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      cms.logger.error(`[cms-mcp] Error finding config: ${errorMessage}`)

      return {
        content: [
          {
            type: 'text' as const,
            text: `Error finding config: ${errorMessage}`,
          },
        ],
      }
    }
  }

  server.registerTool(
    'findConfig',
    {
      description: toolSchemas.findConfig.description,
      inputSchema: toolSchemas.findConfig.parameters.shape,
    },
    ({ includeMetadata }) => {
      return tool(includeMetadata)
    },
  )
}
