import type { GlobalConfig } from '@hanzo/cms'

import { globalEndpoint } from '../shared.js'

export const globalEndpoints: GlobalConfig['endpoints'] = [
  {
    handler: (req) => {
      return Response.json(req.body)
    },
    method: 'post',
    path: `/${globalEndpoint}`,
  },
]
