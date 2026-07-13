import configPromise from '@payload-config'
import { getCMS } from '@hanzo/cms'

export const GET = async (request: Request) => {
  const cms = await getCMS({
    config: configPromise,
  })

  return Response.json({
    message: 'This is an example of a custom route.',
  })
}
