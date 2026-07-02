import type { WorkflowConfig } from @hanzo/cms'from 

export const failsImmediatelyWorkflow: WorkflowConfig<'failsImmediately'> = {
  slug: 'failsImmediately',
  inputSchema: [],
  retries: 0,
  handler: () => {
    throw new Error('This workflow fails immediately')
  },
}
