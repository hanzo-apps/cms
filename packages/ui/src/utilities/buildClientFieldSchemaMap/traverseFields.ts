import type { I18n } from '@hanzo/cms-translations'
import type {
  ClientBlock,
  ClientConfig,
  ClientField,
  ClientFieldSchemaMap,
  FieldSchemaMap,
  CMS,
  TabAsFieldClient,
} from '@hanzo/cms'

import { createClientBlocks, createClientFields } from '@hanzo/cms'
import { fieldAffectsData, getFieldPaths, tabHasName } from '@hanzo/cms/shared'

type Args = {
  clientSchemaMap: ClientFieldSchemaMap
  config: ClientConfig
  fields: (ClientField | TabAsFieldClient)[]
  i18n: I18n<any, any>
  parentIndexPath: string
  parentSchemaPath: string
  cms: CMS
  schemaMap: FieldSchemaMap
}

export const traverseFields = ({
  clientSchemaMap,
  config,
  fields,
  i18n,
  parentIndexPath,
  parentSchemaPath,
  cms,
  schemaMap,
}: Args) => {
  for (const [index, field] of fields.entries()) {
    const { indexPath, schemaPath } = getFieldPaths({
      field,
      index,
      parentIndexPath,
      parentSchemaPath,
    })

    clientSchemaMap.set(schemaPath, field)

    switch (field.type) {
      case 'array': {
        traverseFields({
          clientSchemaMap,
          config,
          fields: field.fields,
          i18n,
          parentIndexPath: '',
          parentSchemaPath: schemaPath,
          cms,
          schemaMap,
        })

        break
      }

      case 'blocks':
        ;(field.blockReferences ?? field.blocks).map((_block) => {
          const block =
            typeof _block === 'string'
              ? config.blocksMap
                ? config.blocksMap[_block]
                : config.blocks.find((block) => typeof block !== 'string' && block.slug === _block)
              : _block

          const blockSchemaPath = `${schemaPath}.${block.slug}`

          clientSchemaMap.set(blockSchemaPath, block)
          traverseFields({
            clientSchemaMap,
            config,
            fields: block.fields,
            i18n,
            parentIndexPath: '',
            parentSchemaPath: schemaPath + '.' + block.slug,
            cms,
            schemaMap,
          })
        })

        break

      case 'collapsible':
      case 'row': {
        traverseFields({
          clientSchemaMap,
          config,
          fields: field.fields,
          i18n,
          parentIndexPath: indexPath,
          parentSchemaPath: schemaPath,
          cms,
          schemaMap,
        })
        break
      }

      case 'group': {
        if (fieldAffectsData(field)) {
          traverseFields({
            clientSchemaMap,
            config,
            fields: field.fields,
            i18n,
            parentIndexPath: '',
            parentSchemaPath: schemaPath,
            cms,
            schemaMap,
          })
        } else {
          traverseFields({
            clientSchemaMap,
            config,
            fields: field.fields,
            i18n,
            parentIndexPath: indexPath,
            parentSchemaPath: schemaPath,
            cms,
            schemaMap,
          })
        }
        break
      }

      case 'richText': {
        // richText sub-fields are not part of the ClientConfig or the Config.
        // They only exist in the field schema map.
        // Thus, we need to
        // 1. get them from the field schema map
        // 2. convert them to client fields
        // 3. add them to the client schema map

        // So these would basically be all fields that are not part of the client config already
        const richTextFieldSchemaMap: FieldSchemaMap = new Map()
        for (const [path, subField] of schemaMap.entries()) {
          if (path.startsWith(`${schemaPath}.`)) {
            richTextFieldSchemaMap.set(path, subField)
          }
        }

        // Now loop through them, convert each entry to a client field and add it to the client schema map.
        // Schema map values are a union: Block | Field | Tab | { fields: Field[] }.
        // Each variant needs different conversion to strip server-only properties.
        for (const [path, subField] of richTextFieldSchemaMap.entries()) {
          if ('slug' in subField) {
            const clientBlocks = createClientBlocks({
              blocks: [subField],
              defaultIDType: cms.config.db.defaultIDType,
              i18n,
              importMap: cms.importMap,
            })

            clientSchemaMap.set(path, clientBlocks[0] as ClientBlock)
            continue
          }

          if ('type' in subField) {
            const clientFields = createClientFields({
              defaultIDType: cms.config.db.defaultIDType,
              disableAddingID: true,
              fields: [subField],
              i18n,
              importMap: cms.importMap,
            })

            clientSchemaMap.set(path, clientFields[0])
            continue
          }

          if ('fields' in subField) {
            const clientFields = createClientFields({
              defaultIDType: cms.config.db.defaultIDType,
              disableAddingID: true,
              fields: subField.fields,
              i18n,
              importMap: cms.importMap,
            })

            clientSchemaMap.set(path, { fields: clientFields })
            continue
          }

          subField satisfies never
        }
        break
      }

      case 'tab': {
        const isNamedTab = tabHasName(field)

        traverseFields({
          clientSchemaMap,
          config,
          fields: field.fields,
          i18n,
          parentIndexPath: isNamedTab ? '' : indexPath,
          parentSchemaPath: schemaPath,
          cms,
          schemaMap,
        })

        break
      }

      case 'tabs': {
        traverseFields({
          clientSchemaMap,
          config,
          fields: field.tabs.map((tab) => ({ ...tab, type: 'tab' })),
          i18n,
          parentIndexPath: indexPath,
          parentSchemaPath: schemaPath,
          cms,
          schemaMap,
        })

        break
      }
    }
  }
}
