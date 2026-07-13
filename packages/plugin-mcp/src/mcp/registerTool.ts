export const registerTool = (
  isEnabled: boolean | undefined,
  toolType: string,
  registrationFn: () => void,
  cms: { logger: { info: (message: string) => void } },
  useVerboseLogs: boolean,
) => {
  if (isEnabled) {
    try {
      registrationFn()
      if (useVerboseLogs) {
        cms.logger.info(`[cms-mcp] ✅ Tool: ${toolType} Registered.`)
      }
    } catch (error) {
      // Log the error and re-throw
      cms.logger.info(`[cms-mcp] ❌ Tool: ${toolType} Failed to register.`)
      throw error
    }
  } else if (useVerboseLogs) {
    cms.logger.info(`[cms-mcp] ⏭️ Tool: ${toolType} Skipped.`)
  }
}
