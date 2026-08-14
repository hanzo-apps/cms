import type {
  FieldHook,
  RelationshipFieldValidation,
  SingleRelationshipField,
  TypedUser,
} from '@hanzo/cms'

import { Forbidden } from '@hanzo/cms'

import type {
  MultiTenantPluginConfig,
  RootTenantFieldConfigOverrides,
  UserWithTenantsField,
} from '../../types.js'

import { defaults } from '../../defaults.js'
import { extractID } from '../../utilities/extractID.js'
import { getCollectionIDType } from '../../utilities/getCollectionIDType.js'
import { getTenantFromCookie } from '../../utilities/getTenantFromCookie.js'
import { getUserTenantIDs } from '../../utilities/getUserTenantIDs.js'

type OwnershipArgs<ConfigType = unknown> = {
  tenantsArrayFieldName: string
  tenantsArrayTenantFieldName: string
  userHasAccessToAllTenants: Required<
    MultiTenantPluginConfig<ConfigType>
  >['userHasAccessToAllTenants']
}

/**
 * Authorization: a caller may only assign a tenant they belong to.
 *
 * `filterOptions` constrains the admin selector, which is presentation — the
 * REST and GraphQL APIs take whatever `tenant` the body carries, so without a
 * server-side check one org can write documents INTO another org's tenant and
 * the victim then reads them as their own.
 *
 * This is a beforeChange field hook rather than a `validate`, because the two
 * answer different questions and Payload treats them differently. `validate`
 * asks "is this value well-formed" and is legitimately skipped whenever
 * `skipValidation` is set — which happens on every draft save of a
 * drafts-enabled collection (collections/operations/create.ts and
 * collections/operations/utilities/update.ts pass
 * `isSavingDraft && !hasDraftValidationEnabled`), and whenever the field's admin
 * `condition` does not pass. A check placed there is therefore simply absent on
 * `POST /<collection>?draft=true`, and the draft it lets through is a real row
 * in the victim's tenant. Authorization asks "may this caller do this" and may
 * never be skipped, so it lives on the beforeChange field hook, which
 * fields/hooks/beforeChange/promise.ts runs unconditionally.
 *
 * An empty value assigns no tenant, so there is nothing to authorize — the
 * required-presence rule stays in `validate` where it belongs. Super users pass
 * `userHasAccessToAllTenants`; system and local-API calls have no `req.user`.
 */
const assertTenantOwnership =
  <ConfigType = unknown>({
    tenantsArrayFieldName,
    tenantsArrayTenantFieldName,
    userHasAccessToAllTenants,
  }: OwnershipArgs<ConfigType>): FieldHook =>
  ({ req, value }) => {
    const user = (req?.user ?? null) as null | UserWithTenantsField

    if (
      !user ||
      userHasAccessToAllTenants(
        user as ConfigType extends { user: unknown } ? ConfigType['user'] : TypedUser,
      )
    ) {
      return value
    }

    const assigned = (Array.isArray(value) ? value : [value])
      .filter((entry) => entry !== null && entry !== undefined)
      .map((entry) => String(extractID(entry as number | string)))

    if (assigned.length === 0) {
      return value
    }

    const owned = new Set(
      getUserTenantIDs(user, { tenantsArrayFieldName, tenantsArrayTenantFieldName }).map(String),
    )

    if (!assigned.every((id) => owned.has(id))) {
      throw new Forbidden(req.t)
    }

    return value
  }

const fieldValidation =
  (validateFunction?: RelationshipFieldValidation): RelationshipFieldValidation =>
  (value, options) => {
    if (validateFunction) {
      const result = validateFunction(value, options)
      if (result !== true) {
        return result
      }
    }

    if (options.hasMany) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return options.req.t('validation:required')
      }
    } else {
      if (!value) {
        return options.req.t('validation:required')
      }
    }

    return true
  }

type Args<ConfigType = unknown> = {
  debug?: boolean
  isAutosaveEnabled?: boolean
  name: string
  overrides?: RootTenantFieldConfigOverrides
  tenantsArrayFieldName: string
  tenantsArrayTenantFieldName: string
  tenantsCollectionSlug: string
  unique: boolean
  userHasAccessToAllTenants: Required<
    MultiTenantPluginConfig<ConfigType>
  >['userHasAccessToAllTenants']
}
export const tenantField = <ConfigType = unknown>({
  name = defaults.tenantFieldName,
  debug,
  isAutosaveEnabled,
  overrides: _overrides = {},
  tenantsArrayFieldName = defaults.tenantsArrayFieldName,
  tenantsArrayTenantFieldName = defaults.tenantsArrayTenantFieldName,
  tenantsCollectionSlug = defaults.tenantCollectionSlug,
  unique,
  // Deny by default: an unthreaded call site must not silently mint super users.
  userHasAccessToAllTenants = () => false,
}: Args<ConfigType>): SingleRelationshipField => {
  const { hasMany = false, hooks: overrideHooks, validate, ...overrides } = _overrides || {}
  return {
    ...(overrides || {}),
    name,
    type: 'relationship',
    access: overrides.access || {},
    admin: {
      allowCreate: false,
      allowEdit: false,
      disableGroupBy: true,
      disableListColumn: true,
      disableListFilter: true,
      position: 'sidebar',
      ...(overrides.admin || {}),
      components: {
        ...(overrides.admin?.components || {}),
        Field: {
          path: '@hanzo/cms-plugin-multi-tenant/client#TenantField',
          ...(typeof overrides.admin?.components?.Field !== 'string'
            ? overrides.admin?.components?.Field || {}
            : {}),
          clientProps: {
            ...(typeof overrides.admin?.components?.Field !== 'string'
              ? (overrides.admin?.components?.Field || {})?.clientProps
              : {}),
            debug,
            unique,
          },
        },
      },
    },
    defaultValue:
      overrides.defaultValue ||
      (async ({ req }) => {
        const idType = getCollectionIDType({
          cms: req.cms,
          collectionSlug: tenantsCollectionSlug,
        })
        const tenantFromCookie = getTenantFromCookie(req.headers, idType)
        if (tenantFromCookie) {
          const isValidTenant = await req.cms.count({
            collection: tenantsCollectionSlug,
            overrideAccess: false,
            req,
            user: req.user,
            where: {
              id: {
                in: [tenantFromCookie],
              },
            },
          })
          return isValidTenant ? tenantFromCookie : null
        }
        if (req.user && isAutosaveEnabled) {
          const userTenants = getUserTenantIDs(req.user, {
            tenantsArrayFieldName,
            tenantsArrayTenantFieldName,
          })
          if (userTenants.length > 0) {
            return userTenants[0]
          }
        }
        return null
      }),
    filterOptions:
      overrides.filterOptions ||
      (({ req }) => {
        const userAssignedTenants = getUserTenantIDs(req.user, {
          tenantsArrayFieldName,
          tenantsArrayTenantFieldName,
        })
        if (userAssignedTenants.length > 0) {
          return {
            id: {
              in: userAssignedTenants,
            },
          }
        }

        return true
      }),
    // The ownership guard is spliced in ahead of any override hooks and is not
    // reachable by `overrides`, which can otherwise replace `hooks` wholesale.
    hooks: {
      ...(overrideHooks || {}),
      beforeChange: [
        assertTenantOwnership({
          tenantsArrayFieldName,
          tenantsArrayTenantFieldName,
          userHasAccessToAllTenants,
        }),
        ...(overrideHooks?.beforeChange || []),
      ],
    },
    index: true,
    relationTo: tenantsCollectionSlug,
    unique,
    ...(hasMany
      ? {
          hasMany: true,
          // TODO: V4 - replace validation with required: true
          validate: fieldValidation(validate as RelationshipFieldValidation),
        }
      : {
          hasMany: false,
          // TODO: V4 - replace validation with required: true
          validate: fieldValidation(validate as RelationshipFieldValidation),
        }),
    // @ts-expect-error translations are not typed for this plugin
    label: overrides.label || (({ t }) => t('plugin-multi-tenant:field-assignedTenant-label')),
  }
}
