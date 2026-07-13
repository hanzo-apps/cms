import type { CMSRequest, SelectType } from '@hanzo/cms'

export type Context = {
  headers: {
    [key: string]: string
  }
  req: CMSRequest
  select: SelectType
}
