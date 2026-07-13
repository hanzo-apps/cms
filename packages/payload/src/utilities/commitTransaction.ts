import type { MarkRequired } from 'ts-essentials'

import type { CMSRequest } from '../types/index.js'

/**
 * complete a transaction calling adapter db.commitTransaction and delete the transactionID from req
 */
export async function commitTransaction(
  req: MarkRequired<Partial<CMSRequest>, 'cms'>,
): Promise<void> {
  const { cms, transactionID } = req

  await cms.db.commitTransaction(transactionID!)
  delete req.transactionID
}
