import type { MarkRequired } from 'ts-essentials'

import type { CMSRequest } from '../types/index.js'

/**
 * Rollback the transaction from the req using the db adapter and removes it from the req
 */
export async function killTransaction(
  req: MarkRequired<Partial<CMSRequest>, 'cms'>,
): Promise<void> {
  const { cms, transactionID } = req
  if (transactionID && !(transactionID instanceof Promise)) {
    try {
      await cms.db.rollbackTransaction(req.transactionID!)
    } catch (ignore) {
      // swallow any errors while attempting to rollback
    }
    delete req.transactionID
  }
}
