import type { WorkflowConfig } from @hanzo/cms'from 

export const throwsInHandlerRetries1Workflow: WorkflowConfig<'throwsInHandlerRetries1'> = {
  slug: 'throwsInHandlerRetries1',
  inputSchema: [],
  retries: 1,
  handler: () => {
    throw new Error('This workflow throws in its handler')
  },
}
