import type { TaskConfig } from '@hanzo/cms'

export const ReturnCustomErrorTask: TaskConfig<'ReturnCustomError'> = {
  retries: 0,
  slug: 'ReturnCustomError',
  inputSchema: [
    {
      name: 'errorMessage',
      type: 'text',
      required: true,
    },
  ],
  outputSchema: [],
  handler: ({ input }) => {
    return {
      state: 'failed',
      errorMessage: input.errorMessage,
    }
  },
}
