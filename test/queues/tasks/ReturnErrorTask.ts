import type { TaskConfig } from '@hanzo/cms'

export const ReturnErrorTask: TaskConfig<'ReturnError'> = {
  retries: 0,
  slug: 'ReturnError',
  inputSchema: [],
  outputSchema: [],
  handler: () => {
    return {
      state: 'failed',
    }
  },
}
