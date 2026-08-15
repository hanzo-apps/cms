/** What the write endpoint does to the text it is given. */
export type WriteAction = 'draft' | 'expand' | 'fix' | 'rewrite' | 'shorten' | 'summarize'

export type HanzoAIPluginConfig = {
  /** Gateway root. Defaults to the SDK's own https://api.hanzo.ai. */
  baseUrl?: string
  enabled?: boolean
  /** Model the image endpoint asks for. */
  imageModel?: string
  /** Upload collection a generated image lands in. */
  mediaSlug?: string
  /** Model the write endpoint asks for. */
  model?: string
  /** Name of the tenant relationship on the media collection. */
  tenantField?: string
  /** Slug of the tenants collection (org == tenant). */
  tenantsSlug?: string
}

export type WriteRequest = {
  action: WriteAction
  /** Document being edited. Rides the gateway as the session. */
  id?: number | string
  /** Extra direction from the editor, on top of the action. */
  instruction?: string
  /** The selection to act on, or the topic to draft from. */
  text: string
}

export type WriteResponse = {
  text: string
}

export type ImageRequest = {
  /** Document being edited. Rides the gateway as the session. */
  id?: number | string
  prompt: string
  size?: string
}

export type ImageResponse = {
  /** Upload collection the image landed in. The editor reads it back rather
   *  than holding a second copy of the setting. */
  collection: string
  id: number | string
  url: null | string
}
