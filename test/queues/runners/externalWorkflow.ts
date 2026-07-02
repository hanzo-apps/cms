import type { WorkflowHandler } from '@hanzo/cms'

export const externalWorkflowHandler: WorkflowHandler<'externalWorkflow'> = async ({
  job,
  tasks,
}) => {
  await tasks.ExternalTask('1', {
    input: {
      message: job.input.message,
    },
  })
}
