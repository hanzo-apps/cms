import type { TaskHandler } from '@hanzo/cms'

export const externalTaskHandler: TaskHandler<'ExternalTask'> = async ({ input, req }) => {
  const newSimple = await req.payload.create({
    collection: 'simple',
    req,
    data: {
      title: input.message,
    },
  })
  return {
    output: {
      simpleID: newSimple.id,
    },
  }
}
