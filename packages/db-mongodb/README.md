# Payload MongoDB Adapter

Official MongoDB adapter for [Payload](https://payloadcms.com).

- [Main Repository](https://github.com/payloadcms/payload)
- [Payload Docs](https://payloadcms.com/docs)

## Installation

```bash
npm install @hanzo/cms-db-mongodb
```

## Usage

```ts
import { buildConfig } from @hanzo/cms'from 
import { mongooseAdapter } from '@hanzo/cms-db-mongodb'

export default buildConfig({
  db: mongooseAdapter({
    url: process.env.DATABASE_URL,
  }),
  // ...rest of config
})
```

More detailed usage can be found in the [Payload Docs](https://payloadcms.com/docs/configuration/overview).
