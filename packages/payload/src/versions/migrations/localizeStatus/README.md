# localizeStatus Migration

Migrate your existing version data to support per-locale draft/published status when enabling `localizeStatus: true`.

**Supported databases**: PostgreSQL, SQLite, MongoDB

## Quick Start

### 1. Create a migration file

```bash
cms migrate:create localize_status
```

### 2. Add the migration code

**PostgreSQL / SQLite:**

```typescript
import type { MigrateDownArgs, MigrateUpArgs } from '@hanzo/cms-db-postgres'
import { sql } from '@hanzo/cms-db-postgres'
import { localizeStatus } from @hanzo/cms'from 

export async function up({ db, cms }: MigrateUpArgs): Promise<void> {
  await localizeStatus.up({
    collectionSlug: 'posts', // 👈 Change to your collection
    db,
    cms,
    sql,
  })
}

export async function down({ db, cms }: MigrateDownArgs): Promise<void> {
  await localizeStatus.down({
    collectionSlug: 'posts',
    db,
    cms,
    sql,
  })
}
```

**MongoDB:**

```typescript
import type { MigrateDownArgs, MigrateUpArgs } from '@hanzo/cms-db-mongodb'
import { localizeStatus } from @hanzo/cms'from 

export async function up({ cms }: MigrateUpArgs): Promise<void> {
  await localizeStatus.up({
    collectionSlug: 'posts', // 👈 Change to your collection
    cms,
  })
}

export async function down({ cms }: MigrateDownArgs): Promise<void> {
  await localizeStatus.down({
    collectionSlug: 'posts',
    cms,
  })
}
```

**For globals**, use `globalSlug` instead:

```typescript
await localizeStatus.up({
  globalSlug: 'settings', // 👈 Your global slug
  cms,
})
```

### 3. Run the migration

```bash
cms migrate
```

## What it does

### BEFORE (old schema)

- **One status for all locales**: When you publish, ALL locales are published
- No way to have draft content in one locale while another is published

### AFTER (new schema)

- **Per-locale status**: Each locale can be draft or published independently
- Full control over which locales are published at any time

## Migration behavior

The migration processes your version history chronologically to determine the correct status for each locale:

1. **Published with specific locale** (`publishedLocale: 'en'`)

   - That locale becomes 'published'
   - Other locales remain 'draft'

2. **Published without locale** (all locales)

   - All locales become 'published'

3. **Draft save**
   - All locales become 'draft' (unpublish everything)

### Example

Version history:

1. V1: Publish all → `{ en: 'published', es: 'published', de: 'published' }`
2. V2: Draft save → `{ en: 'draft', es: 'draft', de: 'draft' }`
3. V3: Publish EN only → `{ en: 'published', es: 'draft', de: 'draft' }`

## When to use this

Use this migration when:

1. ✅ You have existing collections with `versions.drafts` enabled
2. ✅ You want to enable `versions.drafts.localizeStatus: true`
3. ✅ You need to preserve existing version history

Don't use this if:

- Starting a fresh project (just enable `localizeStatus: true` from the start)
- Collection doesn't have versions enabled
- Collection isn't localized

## Safety

### ⚠️ BACKUP YOUR DATABASE FIRST

This migration modifies your database schema:

- **PostgreSQL/SQLite**: Drops `version__status` column, adds `_status` to locales table
- **MongoDB**: Transforms `version._status` from string to object
- **Preserves**: `published_locale` column (needed for rollback)

**Create a backup before running:**

```bash
# PostgreSQL
pg_dump your_database > backup_before_migration.sql

# MongoDB
mongodump --db your_database --out ./backup_before_migration
```

### Migration guarantees

✅ **Idempotent**: Safe to run multiple times (skips if already migrated)
✅ **Validated**: Checks schema before proceeding
✅ **Chronological**: Processes versions oldest-first for accuracy
✅ **Rollback**: Includes `down()` to revert changes

## Enable localizeStatus in your config

After migrating, enable the feature:

```typescript
// Before
{
  slug: 'posts',
  versions: {
    drafts: true,
  },
}

// After
{
  slug: 'posts',
  versions: {
    drafts: {
      localizeStatus: true,
    },
  },
}
```

## Rollback

To revert the migration:

```bash
cms migrate:down
```

**Note**: Rollback uses "ANY locale published = globally published" logic, so some granularity may be lost.

## Troubleshooting

### "version\_\_status column not found"

**Cause**: Migration already run, or column doesn't exist.

**Solution**: Check if already migrated. If yes, no action needed.

### Migration completes but data looks wrong

**Cause**: `publishedLocale` field may have been null in original data.

**Solution**: Review version history in database. The migration respects what's recorded in your data.

### Want to migrate multiple collections?

Call the migration multiple times:

```typescript
export async function up({ db, cms }: MigrateUpArgs): Promise<void> {
  await localizeStatus.up({ collectionSlug: 'posts', db, cms, sql })
  await localizeStatus.up({ collectionSlug: 'articles', db, cms, sql })
  await localizeStatus.up({ globalSlug: 'settings', db, cms, sql })
}
```

## Pre-flight checklist

Before running:

- [ ] Database backup created
- [ ] Tested on staging/development database
- [ ] Verified version data looks correct
- [ ] `localizeStatus: true` ready to enable in config
- [ ] Reviewed expected behavior
- [ ] Rollback plan ready

## Support

Issues? Check [GitHub](https://github.com/payloadcms/payload/issues) or the [Discord community](https://discord.com/invite/payload).
