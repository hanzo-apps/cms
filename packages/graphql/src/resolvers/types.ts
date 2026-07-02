import type { PayloadRequest, SelectType } from '@hanzo/cms'

export type Context = {
  headers: {
    [key: string]: string
  }
  req: PayloadRequest
  select: SelectType
}
