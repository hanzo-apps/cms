import type { AiClient } from '@hanzo/ai'
import type { CMSRequest } from '@hanzo/cms'

import { APIError, createAiClient } from '@hanzo/ai'
import { activeOrg, iamToken } from '@hanzo/cms-auth-iam'

/**
 * A gateway client that acts AS the caller: their own IAM bearer, the org they
 * are acting in, and the document they are editing. Null when the request
 * carries no IAM token, and then nothing is sent at all.
 *
 * There is no machine identity here, and no key in this package. A machine
 * token resolves to a balance-exempt platform account, so it would spend the
 * platform's money and attribute to no org. The caller's own token is what
 * makes attribution, spend limits and metering the gateway's job, which is why
 * this package holds no billing code.
 */
export const caller = async (args: {
  baseUrl?: string
  req: CMSRequest
  session?: number | string
}): Promise<AiClient | null> => {
  const { baseUrl, req, session } = args

  const token = iamToken(req.headers, req.cms)
  if (!token) {
    return null
  }

  const org = await activeOrg(req)

  return createAiClient({
    ...(baseUrl ? { baseUrl } : {}),
    headers: {
      'X-Environment': 'production',
      ...(org ? { 'X-Org-Id': org } : {}),
      ...(session === undefined ? {} : { 'X-Session-Id': String(session) }),
    },
    token,
  })
}

export const reply = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })

const CONSOLE = 'https://console.hanzo.ai'

const OUT_OF_CREDITS = {
  message: `Out of credits. Add credits at ${CONSOLE} to keep using AI.`,
  status: 402,
}

const OVER_CAP = {
  message: `This org has reached its spend cap. Raise it or add credits at ${CONSOLE}.`,
  status: 402,
}

/**
 * Fail closed. The gateway could not read the balance, so it does not know
 * whether the call is payable — running it anyway spends money nobody agreed
 * to, and reporting success without running it is a lie.
 */
const NO_BALANCE = {
  message: 'Credit balance is unavailable, so nothing was run. Try again shortly.',
  status: 503,
}

const BY_CODE: Record<string, { message: string; status: number }> = {
  balance_unavailable: NO_BALANCE,
  insufficient_balance: OUT_OF_CREDITS,
  spend_cap_exceeded: OVER_CAP,
}

/** The same outcomes, for a gateway that names them by status alone. */
const BY_STATUS: Record<number, { message: string; status: number }> = {
  402: OUT_OF_CREDITS,
  503: NO_BALANCE,
}

const codeOf = (err: unknown): string => {
  if (!(err instanceof APIError)) {
    return ''
  }
  const body = err.body as null | Record<string, unknown> | undefined
  const error = body?.error
  if (typeof error === 'string') {
    return error
  }
  const source = (error && typeof error === 'object' ? error : body) as
    | Record<string, unknown>
    | undefined
  const code = source?.code ?? source?.type
  return typeof code === 'string' ? code : ''
}

/**
 * Turns a gateway failure into a refusal the editor can read. The upstream body
 * goes to the log and never to the client: it carries provider names, prompts
 * and stacks. What crosses back is one of the messages above.
 */
export const refuse = (args: { err: unknown; req: CMSRequest }): Response => {
  const { err, req } = args
  req.cms.logger.error({ err, msg: 'hanzo ai request failed' })

  const named =
    BY_CODE[codeOf(err)] ?? (err instanceof APIError ? BY_STATUS[err.status] : undefined)
  if (named) {
    return reply({ message: named.message }, named.status)
  }

  if (err instanceof APIError && (err.status === 401 || err.status === 403)) {
    return reply({ message: 'This account is not authorized to use AI.' }, err.status)
  }
  return reply({ message: 'The AI request failed.' }, 502)
}
