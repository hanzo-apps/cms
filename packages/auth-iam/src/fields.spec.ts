import { describe, expect, it } from 'vitest'

import { iamAuthFields } from './index.js'

/**
 * The claim fields carry the tenant and the org-admin bit, so a client able to
 * write one is a client able to change its own scope. `admin.readOnly` only
 * greys the input out; field access is what REST and GraphQL are held to.
 */

const named = (name: string) => {
  const field = iamAuthFields.find((f) => 'name' in f && f.name === name)

  if (!field) {
    throw new Error(`iamAuthFields must declare ${name}`)
  }

  return field as { access?: { create?: () => boolean; update?: () => boolean } }
}

describe('iamAuthFields', () => {
  it.each(['iamSub', 'iamOrg', 'username', 'isAdmin', 'groups'])(
    'refuses client writes to %s',
    (name) => {
      const { access } = named(name)

      expect(access?.create, `${name} must declare create access`).toBeTypeOf('function')
      expect(access?.update, `${name} must declare update access`).toBeTypeOf('function')
      expect(access!.create!()).toBe(false)
      expect(access!.update!()).toBe(false)
    },
  )
})
