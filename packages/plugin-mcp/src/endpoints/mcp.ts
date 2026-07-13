import crypto from 'crypto'
import { type CMSHandler, type TypedUser, UnauthorizedError, type Where } from '@hanzo/cms'

import type { MCPAccessSettings, MCPPluginConfig } from '../types.js'

import { createRequestFromCMSRequest } from '../mcp/createRequest.js'
import { getMCPHandler } from '../mcp/getMcpHandler.js'

export const initializeMCPHandler = (pluginOptions: MCPPluginConfig) => {
  const mcpHandler: CMSHandler = async (req) => {
    const { cms } = req
    const MCPOptions = pluginOptions.mcp || {}
    const MCPHandlerOptions = MCPOptions.handlerOptions || {}
    const useVerboseLogs = MCPHandlerOptions.verboseLogs ?? false

    req.cmsAPI = 'MCP' as const

    const getDefaultMcpAccessSettings = async (overrideApiKey?: null | string) => {
      const apiKey =
        (overrideApiKey ?? req.headers.get('Authorization')?.startsWith('Bearer '))
          ? req.headers.get('Authorization')?.replace('Bearer ', '').trim()
          : null

      if (apiKey === null) {
        throw new UnauthorizedError()
      }

      const sha256APIKeyIndex = crypto
        .createHmac('sha256', cms.secret)
        .update(apiKey || '')
        .digest('hex')

      const where: Where = {
        apiKeyIndex: {
          equals: sha256APIKeyIndex,
        },
      }

      const { docs } = await cms.find({
        collection: 'cms-mcp-api-keys',
        depth: 1,
        limit: 1,
        pagination: false,
        where,
      })

      if (docs.length === 0) {
        throw new UnauthorizedError()
      }

      if (useVerboseLogs) {
        cms.logger.info('[cms-mcp] API Key is valid')
      }

      const user = docs[0]?.user as TypedUser
      user.collection = pluginOptions.userCollection as string
      user._strategy = 'mcp-api-key' as const

      return docs[0] as unknown as MCPAccessSettings
    }

    const mcpAccessSettings = pluginOptions.overrideAuth
      ? await pluginOptions.overrideAuth(req, getDefaultMcpAccessSettings)
      : await getDefaultMcpAccessSettings()

    // @modelcontextprotocol/sdk's StreamableHTTPServerTransport uses @hono/node-server's
    // getRequestListener, which replaces global.Request and global.Response with Hono
    // custom classes. Unfortunately, we cannot pass overrideGlobalObjects: false because the option is
    // consumed inside the SDK transport and is not exposed to callers.
    // Save originals here and restore after the handler resolves so that Next.js
    // instanceof Response checks on subsequent route handlers keep working.
    const globals = globalThis as Record<string, unknown>
    const originalResponse = globals['Response']
    const originalRequest = globals['Request']

    const handler = getMCPHandler(pluginOptions, mcpAccessSettings, req)
    const request = createRequestFromCMSRequest(req)

    try {
      return await handler(request)
    } finally {
      if (globals['Response'] !== originalResponse) {
        Object.defineProperty(globalThis, 'Response', { value: originalResponse })
      }
      if (globals['Request'] !== originalRequest) {
        Object.defineProperty(globalThis, 'Request', { value: originalRequest })
      }
    }
  }
  return mcpHandler
}
