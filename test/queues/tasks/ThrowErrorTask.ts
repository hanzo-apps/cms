import type { TaskConfig } from @hanzo/cms'from 

export const ThrowErrorTask: TaskConfig<'ThrowError'> = {
  retries: 0,
  slug: 'ThrowError',
  inputSchema: [],
  outputSchema: [],
  handler: () => {
    throw new Error('failed')
  },
}
