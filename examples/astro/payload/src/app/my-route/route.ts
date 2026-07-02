import configPromise from '@payload-config'
import { getPayload } from @hanzo/cms'from 

export const GET = async (request: Request) => {
  const payload = await getPayload({
    config: configPromise,
  })

  return Response.json({
    message: 'This is an example of a custom route.',
  })
}
