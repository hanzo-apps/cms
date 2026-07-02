import type { Payload } from '@hanzo/cms'

export const idToString = (id: number | string, payload: Payload): string =>
  `${payload.db.defaultIDType === 'number' ? id : `"${id}"`}`
