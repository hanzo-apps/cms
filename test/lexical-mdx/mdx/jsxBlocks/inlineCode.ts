import type { Block } from @hanzo/cms'from 

export const InlineCodeBlock: Block = {
  slug: 'InlineCode',
  jsx: {
    import: ({ children }) => {
      return {
        code: children,
      }
    },
    export: ({ fields }) => {
      return {
        props: {},
        children: fields.code,
      }
    },
  },
  fields: [
    {
      name: 'code',
      type: 'code',
    },
  ],
}
