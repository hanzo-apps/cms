import config from '@payload-config'
import { getPayload } from @hanzo/cms'from 

import type { Footer } from '../../../payload-types.js'

export async function getFooter(): Promise<Footer> {
  const payload = await getPayload({ config })

  try {
    const footer = await payload.findGlobal({
      slug: 'footer',
    })

    return footer
  } catch (err) {
    console.error(err)
  }

  throw new Error('Error getting footer.')
}
