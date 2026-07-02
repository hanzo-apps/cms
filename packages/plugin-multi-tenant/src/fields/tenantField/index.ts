import type { RelationshipFieldValidation, SingleRelationshipField } from '@hanzo/cms'

import type { RootTenantFieldConfigOverrides, UserWithTenantsField } from '../../types.js'

import { defaults } from '../../defaults.js'
import { extractID } from '../../utilities/extractID.js'
import { getCollectionIDType } from '../../utilities/getCollectionIDType.js'
import { getTenantFromCookie } from '../../utilities/getTenantFromCookie.js'
import { getUserTenantIDs } from '../../utilities/getUserTenantIDs.js'

type FieldValidationArgs = {
  tenantsArrayFieldName: string
  tenantsArrayTenantFieldName: string
  userHasAccessToAllTenants: (user: UserWithTenantsField) => boolean
  validateFunction?: RelationshipFieldValidation
}

const fieldValidation =
  ({
    tenantsArrayFieldName,
    tenantsArrayTenantFieldName,
    userHasAccessToAllTenants,
    validateFunction,
  }: FieldValidationArgs): RelationshipFieldValidation =>
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

    // Tenant-ownership enforcement (defense in depth against cross-tenant writes).
    // The admin UI restricts the selector via filterOptions, but the REST/GraphQL
    // API would otherwise accept an arbitrary `tenant` value — letting one org
    // write documents INTO another org's tenant (a cross-tenant integrity breach,
    // and a cross-tenant read once the victim lists their content). An
    // authenticated non-super user may only assign a tenant they belong to.
    // System/local-API calls (no req.user) are trusted and skip this.
    const user = options.req?.user as null | UserWithTenantsField
    if (user && !userHasAccessToAllTenants(user)) {
      const allowed = getUserTenantIDs(user, {
        tenantsArrayFieldName,
        tenantsArrayTenantFieldName,
      }).map((id) => String(id))
      const assigned = (Array.isArray(value) ? value : [value])
        .filter((v) => v !== null && v !== undefined)
        .map((v) => String(extractID(v as number | string)))
      const ownsAll = assigned.length > 0 && assigned.every((id) => allowed.includes(id))
      if (!ownsAll) {
        return options.req.t('validation:required')
      }
    }

    return true
  }

type Args = {
  debug?: boolean
  isAutosaveEnabled?: boolean
  name: string
  overrides?: RootTenantFieldConfigOverrides
  tenantsArrayFieldName: string
  tenantsArrayTenantFieldName: string
  tenantsCollectionSlug: string
  unique: boolean
  userHasAccessToAllTenants: (user: UserWithTenantsField) => boolean
}
export const tenantField = ({
  name = defaults.tenantFieldName,
  debug,
  isAutosaveEnabled,
  overrides: _overrides = {},
  tenantsArrayFieldName = defaults.tenantsArrayFieldName,
  tenantsArrayTenantFieldName = defaults.tenantsArrayTenantFieldName,
  tenantsCollectionSlug = defaults.tenantCollectionSlug,
  unique,
  userHasAccessToAllTenants = () => false,
}: Args): SingleRelationshipField => {
  const { hasMany = false, validate, ...overrides } = _overrides || {}
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
          collectionSlug: tenantsCollectionSlug,
          payload: req.payload,
        })
        const tenantFromCookie = getTenantFromCookie(req.headers, idType)
        if (tenantFromCookie) {
          const isValidTenant = await req.payload.count({
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
    index: true,
    relationTo: tenantsCollectionSlug,
    unique,
    ...(hasMany
      ? {
          hasMany: true,
          // TODO: V4 - replace validation with required: true
          validate: fieldValidation({
            tenantsArrayFieldName,
            tenantsArrayTenantFieldName,
            userHasAccessToAllTenants,
            validateFunction: validate as RelationshipFieldValidation,
          }),
        }
      : {
          hasMany: false,
          // TODO: V4 - replace validation with required: true
          validate: fieldValidation({
            tenantsArrayFieldName,
            tenantsArrayTenantFieldName,
            userHasAccessToAllTenants,
            validateFunction: validate as RelationshipFieldValidation,
          }),
        }),
    // @ts-expect-error translations are not typed for this plugin
    label: overrides.label || (({ t }) => t('plugin-multi-tenant:field-assignedTenant-label')),
  }
}
