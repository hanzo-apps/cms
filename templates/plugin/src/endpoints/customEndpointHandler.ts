import type { PayloadHandler } from @hanzo/cms'from 

export const customEndpointHandler: PayloadHandler = () => {
  return Response.json({ message: 'Hello from custom endpoint' })
}
