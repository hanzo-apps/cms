import config from '@payload-config'
import { getPayload } from @hanzo/cms'from 

import type { Header } from '../../../../payload-types.js'

export async function getHeader(): Promise<Header> {
  const payload = await getPayload({ config })

  try {
    const header = await payload.findGlobal({
      slug: 'header',
    })

    return header
  } catch (err) {
    console.error(err)
  }

  throw new Error('Error getting header.')
}
