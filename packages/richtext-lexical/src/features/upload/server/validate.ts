import { fieldSchemasToFormState } from '@hanzo/cms-ui/forms/fieldSchemasToFormState'
import { isValidID } from '@hanzo/cms'

import type { NodeValidation } from '../../typesServer.js'
import type { UploadFeatureProps } from './index.js'
import type { SerializedUploadNode } from './nodes/UploadNode.js'

export const uploadValidation = (
  props: UploadFeatureProps,
): NodeValidation<SerializedUploadNode> => {
  return async ({
    node,
    validation: {
      options: {
        id,
        data,
        operation,
        preferences,
        req,
        req: { cms, t },
      },
    },
  }) => {
    const idType = cms.collections[node.relationTo]?.customIDType || cms.db.defaultIDType
    // @ts-expect-error - Fix in CMS v4
    const nodeID = node?.value?.id || node?.value // for backwards-compatibility

    if (!isValidID(nodeID, idType)) {
      return t('validation:validUploadID')
    }

    if (!props?.collections) {
      return true
    }

    if (Object.keys(props?.collections).length === 0) {
      return true
    }

    const collection = props?.collections[node.relationTo]

    if (!collection?.fields?.length) {
      return true
    }

    const result = await fieldSchemasToFormState({
      id,
      collectionSlug: node.relationTo,
      data: node?.fields ?? {},
      documentData: data,
      fields: collection.fields,
      fieldSchemaMap: undefined,
      initialBlockData: node?.fields ?? {},
      operation: operation === 'create' || operation === 'update' ? operation : 'update',
      permissions: {},
      preferences,
      renderAllFields: false,
      req,
      schemaPath: '',
    })

    const errorPathsSet = new Set<string>()
    for (const fieldKey in result) {
      const fieldState = result[fieldKey]
      if (fieldState?.errorPaths?.length) {
        for (const errorPath of fieldState.errorPaths) {
          errorPathsSet.add(errorPath)
        }
      }
    }
    const errorPaths = Array.from(errorPathsSet)

    if (errorPaths.length) {
      return 'The following fields are invalid: ' + errorPaths.join(', ')
    }

    return true
  }
}
