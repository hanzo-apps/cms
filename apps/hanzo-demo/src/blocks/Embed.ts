import type { Block, TextFieldSingleValidation } from '@hanzo/cms'

/**
 * Third-party embed rendered in an iframe, so `url` admits https only.
 * A field `validate` supplants Payload's default text validation rather than
 * running beside it (sanitize.ts assigns the default only when `validate` is
 * undefined), so this one also answers for the empty value `required` names.
 * Every other scheme — http, javascript:, data: — and anything the URL parser
 * refuses fails here, ahead of storage.
 */
export const Embed: Block = {
  slug: 'embed',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      validate: ((value) => {
        if (typeof value !== 'string' || value.trim() === '') {
          return 'Enter an https:// URL.'
        }

        let parsed: URL

        try {
          parsed = new URL(value)
        } catch {
          return 'Enter a whole URL, scheme and host included.'
        }

        if (parsed.protocol !== 'https:') {
          return 'Only https:// URLs embed.'
        }

        return true
      }) as TextFieldSingleValidation,
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
  interfaceName: 'EmbedBlock',
  labels: {
    plural: 'Embeds',
    singular: 'Embed',
  },
}
