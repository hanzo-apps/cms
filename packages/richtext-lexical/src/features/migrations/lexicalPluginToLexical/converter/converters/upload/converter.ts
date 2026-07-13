/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SerializedUploadNode } from '../../../../../upload/server/nodes/UploadNode.js'
import type { LexicalPluginNodeConverter } from '../../types.js'

export const UploadConverter: LexicalPluginNodeConverter = {
  converter({ lexicalPluginNode }) {
    let fields = {}
    if ((lexicalPluginNode as any)?.caption?.editorState) {
      fields = {
        caption: (lexicalPluginNode as any)?.caption,
      }
    }
    return {
      type: 'upload',
      fields,
      format: (lexicalPluginNode as any)?.format || '',
      relationTo: (lexicalPluginNode as any)?.rawImageCMS?.relationTo,
      value: (lexicalPluginNode as any)?.rawImageCMS?.value?.id || '',
      version: 2,
    } as const as SerializedUploadNode
  },
  nodeTypes: ['upload'],
}
