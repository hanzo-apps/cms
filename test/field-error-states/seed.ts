import type { Payload } from '@hanzo/cms'

import { devUser } from '../credentials.js'

export const seed = async (payload: Payload) => {
  await payload.create({
    collection: 'users',
    data: {
      email: devUser.email,
      password: devUser.password,
    },
  })
}
