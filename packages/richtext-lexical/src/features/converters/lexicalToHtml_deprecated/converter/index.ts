import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import type { CMS, CMSRequest } from '@hanzo/cms'

import { createLocalReq } from '@hanzo/cms'

import type { HTMLConverter, SerializedLexicalNodeWithParent } from './types.js'

import { hasText } from '../../../../validate/hasText.js'

/**
 * @deprecated - will be removed in 4.0
 */
export type ConvertLexicalToHTMLArgs = {
  converters: HTMLConverter[]
  currentDepth?: number
  data: SerializedEditorState
  depth?: number
  draft?: boolean // default false
  overrideAccess?: boolean // default false
  showHiddenFields?: boolean // default false
} & (
  | {
      /**
       * This cms property will only be used if req is undefined.
       */
      cms?: never
      /**
       * When the converter is called, req CAN be passed in depending on where it's run.
       * If this is undefined and config is passed through, lexical will create a new req object for you. If this is null or
       * config is undefined, lexical will not create a new req object for you and local API / server-side-only
       * functionality will be disabled.
       */
      req: CMSRequest
    }
  | {
      /**
       * This cms property will only be used if req is undefined.
       */
      cms?: CMS
      /**
       * When the converter is called, req CAN be passed in depending on where it's run.
       * If this is undefined and config is passed through, lexical will create a new req object for you. If this is null or
       * config is undefined, lexical will not create a new req object for you and local API / server-side-only
       * functionality will be disabled.
       */
      req?: null | undefined
    }
)

/**
 * @deprecated - will be removed in 4.0. Use the function exported from `@hanzo/cms-richtext-lexical/html` instead.
 * @example
 * ```ts
 * // old (deprecated)
 * import { convertLexicalToHTML } from '@hanzo/cms-richtext-lexical'
 * // new (recommended)
 * import { convertLexicalToHTML } from '@hanzo/cms-richtext-lexical/html'
 * ```
 * For more details, you can refer to https://payloadcms.com/docs/rich-text/converting-html to see all the
 * ways to convert lexical to HTML.
 */
export async function convertLexicalToHTML({
  converters,
  currentDepth,
  data,
  depth,
  draft,
  overrideAccess,
  cms,
  req,
  showHiddenFields,
}: ConvertLexicalToHTMLArgs): Promise<string> {
  if (hasText(data)) {
    if (req === undefined && cms) {
      req = await createLocalReq({}, cms)
    }

    if (!currentDepth) {
      currentDepth = 0
    }

    if (!depth) {
      depth = req?.cms?.config?.defaultDepth
    }

    return await convertLexicalNodesToHTML({
      converters,
      currentDepth,
      depth: depth!,
      draft: draft === undefined ? false : draft,
      lexicalNodes: data?.root?.children,
      overrideAccess: overrideAccess === undefined ? false : overrideAccess,
      parent: data?.root,
      req: req!,
      showHiddenFields: showHiddenFields === undefined ? false : showHiddenFields,
    })
  }
  return ''
}

/**
 * @deprecated - will be removed in 4.0
 */
export async function convertLexicalNodesToHTML({
  converters,
  currentDepth,
  depth,
  draft,
  lexicalNodes,
  overrideAccess,
  parent,
  req,
  showHiddenFields,
}: {
  converters: HTMLConverter[]
  currentDepth: number
  depth: number
  draft: boolean
  lexicalNodes: SerializedLexicalNode[]
  overrideAccess: boolean
  parent: SerializedLexicalNodeWithParent
  /**
   * When the converter is called, req CAN be passed in depending on where it's run.
   */
  req: null | CMSRequest
  showHiddenFields: boolean
}): Promise<string> {
  const unknownConverter = converters.find((converter) => converter.nodeTypes.includes('unknown'))

  const htmlArray = await Promise.all(
    lexicalNodes.map(async (node, i) => {
      const converterForNode = converters.find((converter) =>
        converter.nodeTypes.includes(node.type),
      )
      try {
        if (!converterForNode) {
          if (unknownConverter) {
            return await unknownConverter.converter({
              childIndex: i,
              converters,
              currentDepth,
              depth,
              draft,
              node,
              overrideAccess,
              parent,
              req,
              showHiddenFields,
            })
          }
          return '<span>unknown node</span>'
        }
        return await converterForNode.converter({
          childIndex: i,
          converters,
          currentDepth,
          depth,
          draft,
          node,
          overrideAccess,
          parent,
          req,
          showHiddenFields,
        })
      } catch (error) {
        console.error('Error converting lexical node to HTML:', error, 'node:', node)
        return ''
      }
    }),
  )

  return htmlArray.join('') || ''
}
