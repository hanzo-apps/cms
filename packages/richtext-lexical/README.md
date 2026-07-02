# Payload Lexical Rich Text Editor

Lexical Rich Text Editor for [Payload](https://payloadcms.com).

- [Main Repository](https://github.com/payloadcms/payload)
- [Payload Docs](https://payloadcms.com/docs)

## Installation

```bash
npm install @hanzo/cms-richtext-lexical
```

## Usage

```ts
import { buildConfig } from @hanzo/cms'from 
import { lexicalEditor } from '@hanzo/cms-richtext-lexical'

export default buildConfig({
  editor: lexicalEditor({}),
  // ...rest of config
})
```

More detailed usage can be found in the [Payload Docs](https://payloadcms.com/docs/configuration/overview).
