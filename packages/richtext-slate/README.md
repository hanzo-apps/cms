# Payload Slate Rich Text Editor

Slate Rich Text Editor for [Payload](https://payloadcms.com).

- [Main Repository](https://github.com/payloadcms/payload)
- [Payload Docs](https://payloadcms.com/docs)

## Installation

```bash
npm install @hanzo/cms-richtext-slate
```

## Usage

```ts
import { buildConfig } from @hanzo/cms'from 
import { slateEditor } from '@hanzo/cms-richtext-slate'

export default buildConfig({
  editor: slateEditor({}),
  // ...rest of config
})
```

More detailed usage can be found in the [Payload Docs](https://payloadcms.com/docs/configuration/overview).
