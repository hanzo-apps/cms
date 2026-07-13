import type { CMSRequest } from '@hanzo/cms'

/**
 * Creates a modified request object with the cart secret injected into context.
 * This allows the access control (hasCartSecretAccess) to properly verify guest cart access.
 *
 * @param req - The original CMSRequest
 * @param secret - The cart secret to inject
 * @returns A new request object with the secret in context, or the original if no secret
 */
export const createRequestWithSecret = (
  req: CMSRequest | undefined,
  secret: string | undefined,
): CMSRequest | undefined => {
  if (!secret || !req) {
    return req
  }

  return {
    ...req,
    context: {
      ...req.context,
      cartSecret: secret,
    },
  } as CMSRequest
}
