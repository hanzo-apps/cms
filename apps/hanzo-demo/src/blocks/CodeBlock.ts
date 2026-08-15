import type { Block } from '@hanzo/cms'

/**
 * Source listing. `language` names the grammar the frontend highlights with;
 * `code` holds the literal text, whitespace intact.
 */
export const CodeBlock: Block = {
  slug: 'code',
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'plaintext',
      options: [
        { label: 'TypeScript', value: 'typescript' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TSX', value: 'tsx' },
        { label: 'Go', value: 'go' },
        { label: 'Rust', value: 'rust' },
        { label: 'Python', value: 'python' },
        { label: 'Bash', value: 'bash' },
        { label: 'JSON', value: 'json' },
        { label: 'YAML', value: 'yaml' },
        { label: 'SQL', value: 'sql' },
        { label: 'Plain text', value: 'plaintext' },
      ],
    },
    {
      name: 'code',
      type: 'textarea',
      required: true,
    },
  ],
  interfaceName: 'CodeBlock',
  labels: {
    plural: 'Code',
    singular: 'Code',
  },
}
