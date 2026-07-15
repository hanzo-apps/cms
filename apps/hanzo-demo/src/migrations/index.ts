import * as migration_20260715_055204_add_local_auth from './20260715_055204_add_local_auth'

export const migrations = [
  {
    name: '20260715_055204_add_local_auth',
    down: migration_20260715_055204_add_local_auth.down,
    up: migration_20260715_055204_add_local_auth.up,
  },
]
