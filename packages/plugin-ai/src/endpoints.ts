import type { ChatCompletion } from '@hanzo/ai'
import type { Endpoint } from '@hanzo/cms'

import type { HanzoAIPluginConfig, ImageRequest, WriteAction, WriteRequest } from './types.js'

import { caller, refuse, reply } from './gateway.js'

const SIGN_IN = 'Sign in to use AI.'

const SYSTEM =
  'You edit prose inside a CMS. Return only the finished text: no preamble, no quotes, no markdown fences.'

const DIRECTIVES: Record<WriteAction, string> = {
  draft: 'Write prose on this topic.',
  expand: 'Expand this text with more detail. Keep the voice.',
  fix: 'Correct grammar, spelling and punctuation. Change nothing else.',
  rewrite: 'Rewrite this text more clearly. Keep the meaning.',
  shorten: 'Shorten this text. Keep the meaning.',
  summarize: 'Summarize this text.',
}

/** A completion's text, whether the model answered in one part or several. */
const textOf = (completion: ChatCompletion): string => {
  const content = completion.choices[0]?.message?.content
  if (typeof content === 'string') {
    return content
  }
  return (content ?? []).map((part) => (part.type === 'text' ? part.text : '')).join('')
}

type Image = { b64_json?: string; url?: string }

type Generated = { data?: Image[] }

/** The image itself, inline or fetched from where the gateway put it. */
const download = async (image: Image): Promise<{ data: Buffer; mimetype: string } | undefined> => {
  if (image.b64_json) {
    return { data: Buffer.from(image.b64_json, 'base64'), mimetype: 'image/png' }
  }
  if (!image.url) {
    return undefined
  }
  const res = await fetch(image.url)
  if (!res.ok) {
    return undefined
  }
  return {
    data: Buffer.from(await res.arrayBuffer()),
    mimetype: res.headers.get('content-type')?.split(';')[0] ?? 'image/png',
  }
}

/** A meaningful string from an untrusted body, or nothing. */
const str = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value : undefined

/** An id from an untrusted body, or nothing. */
const scalar = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string' ? value : undefined

const filename = (args: { mimetype: string; prompt: string }): string => {
  const stem =
    args.prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'image'
  return `${stem}.${args.mimetype.split('/')[1] ?? 'png'}`
}

/**
 * The editor endpoints, mounted by the plugin under the framework's existing
 * REST route: `${routes.api}/ai/write` and `${routes.api}/ai/image`.
 *
 * Both are short and synchronous. An editor action finishes in one response, so
 * there is nothing to stream and no relay to keep alive.
 */
export const endpoints = (pluginConfig: HanzoAIPluginConfig): Endpoint[] => {
  const { baseUrl } = pluginConfig
  const imageModel = pluginConfig.imageModel ?? 'zen3-image'
  const mediaSlug = pluginConfig.mediaSlug ?? 'media'
  const model = pluginConfig.model ?? 'zen3'

  return [
    {
      handler: async (req) => {
        const body = ((await req.json?.()) ?? {}) as Partial<WriteRequest>
        const directive = body.action ? DIRECTIVES[body.action] : undefined
        const text = str(body.text)
        if (!directive || !text) {
          return reply({ message: 'Send an action and text.' }, 400)
        }

        const ai = await caller({ baseUrl, req, session: scalar(body.id) })
        if (!ai) {
          return reply({ message: SIGN_IN }, 401)
        }

        try {
          const completion = await ai.chat.completions.create({
            messages: [
              { content: SYSTEM, role: 'system' },
              {
                content: [directive, str(body.instruction), text].filter(Boolean).join('\n\n'),
                role: 'user',
              },
            ],
            model,
          })
          return reply({ text: textOf(completion) })
        } catch (err) {
          return refuse({ err, req })
        }
      },
      method: 'post',
      path: '/ai/write',
    },
    {
      handler: async (req) => {
        const body = ((await req.json?.()) ?? {}) as Partial<ImageRequest>
        const prompt = str(body.prompt)
        if (!prompt) {
          return reply({ message: 'Send a prompt.' }, 400)
        }

        const ai = await caller({ baseUrl, req, session: scalar(body.id) })
        if (!ai) {
          return reply({ message: SIGN_IN }, 401)
        }

        const size = str(body.size)

        try {
          const generated = await ai.http.json<Generated>({
            body: {
              model: imageModel,
              n: 1,
              prompt,
              ...(size ? { size } : {}),
            },
            method: 'POST',
            path: '/v1/images/generations',
          })

          const image = generated.data?.[0]
          const file = image ? await download(image) : undefined
          if (!file) {
            return reply({ message: 'The AI returned no image.' }, 502)
          }

          // Through the request, so the upload lands as the caller: access runs,
          // the tenant field takes the org they are acting in, and storage keys
          // the object under that org's prefix.
          const media = (await req.cms.create({
            collection: mediaSlug,
            data: { alt: prompt },
            file: {
              name: filename({ mimetype: file.mimetype, prompt }),
              data: file.data,
              mimetype: file.mimetype,
              size: file.data.length,
            },
            overrideAccess: false,
            req,
          })) as { id: number | string; url?: null | string }

          return reply({ id: media.id, collection: mediaSlug, url: media.url ?? null })
        } catch (err) {
          return refuse({ err, req })
        }
      },
      method: 'post',
      path: '/ai/image',
    },
  ]
}
