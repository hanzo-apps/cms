# Payload D1 SQLite Adapter

Official D1 SQLite adapter for [Payload](https://payloadcms.com).

- [Main Repository](https://github.com/payloadcms/payload)
- [Payload Docs](https://payloadcms.com/docs)

## Installation

```bash
npm install @hanzo/cms-db-d1-sqlite
```

## Usage

```ts
import { sqliteD1Adapter } from '@hanzo/cms-db-d1-sqlite'

export default buildConfig({
  // Your config goes here
  collections: [
    // Collections go here
  ],
  // Configure the D1 adapter here
  db: sqliteD1Adapter({
    // D1-specific arguments go here.
    // `binding` is required and should match the D1 database binding name in your Cloudflare Worker environment.
    binding: cloudflare.env.D1,
  }),
})
```

More detailed usage can be found in the [Payload Docs](https://payloadcms.com/docs/database/sqlite).
