import { AuthenticationError, type CMSRequest } from '@hanzo/cms'

export const createRequestFromCMSRequest = (req: CMSRequest) => {
  if (!req.url) {
    throw new AuthenticationError()
  }
  return new Request(req.url, {
    body: req.body,
    duplex: 'half',
    headers: req.headers,
    method: req.method,
  } as { duplex: 'half' } & RequestInit)
}
