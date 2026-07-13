import { renderPlaygroundPage } from 'graphql-playground-html'
import { createCMSRequest, type SanitizedConfig } from '@hanzo/cms'
import { formatAdminURL } from '@hanzo/cms/shared'

export const GET = (config: Promise<SanitizedConfig>) => async (request: Request) => {
  const req = await createCMSRequest({
    config,
    request,
  })

  if (
    (!req.cms.config.graphQL.disable &&
      !req.cms.config.graphQL.disablePlaygroundInProduction &&
      process.env.NODE_ENV === 'production') ||
    process.env.NODE_ENV !== 'production'
  ) {
    const endpoint = formatAdminURL({
      apiRoute: req.cms.config.routes.api,
      path: req.cms.config.routes.graphQL as `/${string}`,
    })
    return new Response(
      renderPlaygroundPage({
        endpoint,
        settings: {
          'request.credentials': 'include',
        },
      }),
      {
        headers: {
          'Content-Type': 'text/html',
        },
        status: 200,
      },
    )
  } else {
    return new Response('Route Not Found', { status: 404 })
  }
}
