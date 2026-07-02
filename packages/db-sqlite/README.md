# Payload SQLite Adapter

Official SQLite adapter for [Payload](https://payloadcms.com).

- [Main Repository](https://github.com/payloadcms/payload)
- [Payload Docs](https://payloadcms.com/docs)

## Installation

```bash
npm install @hanzo/cms-db-sqlite
```

## Usage

```ts
import { buildConfig } from @hanzo/cms'from 
import { sqliteAdapter } from '@hanzo/cms-db-sqlite'

export default buildConfig({
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL,
    },
  }),
  // ...rest of config
})
```

More detailed usage can be found in the [Payload Docs](https://payloadcms.com/docs/configuration/overview).
