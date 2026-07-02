import configPromise from '@payload-config'
import { getPayload } from '@hanzo/cms'

export const Page = async ({ params, searchParams }) => {
  const payload = await getPayload({
    config: configPromise,
  })
  return <div>test ${payload?.config?.collections?.length}</div>
}

export default Page
