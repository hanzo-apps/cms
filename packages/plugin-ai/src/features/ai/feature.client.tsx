'use client'

import type {
  PluginComponent,
  SlashMenuGroup,
  ToolbarGroup,
  ToolbarGroupItem,
} from '@hanzo/cms-richtext-lexical'
import type { BaseSelection, LexicalEditor } from '@hanzo/cms-richtext-lexical/lexical'

import {
  $createUploadNode,
  AIIcon,
  createClientFeature,
  UploadNode,
} from '@hanzo/cms-richtext-lexical/client'
import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  $setSelection,
} from '@hanzo/cms-richtext-lexical/lexical'
import { toast, useDocumentInfo } from '@hanzo/cms-ui'
import { useEffect } from 'react'

import type { ImageResponse, WriteAction, WriteResponse } from '../../types.js'

/**
 * The document being edited. The gateway takes it as the session, so spend and
 * telemetry group by document. Toolbar handlers run outside React, which is why
 * the id is published from a plugin rather than read from a hook where it is
 * used. One document per page, so one cell serves every editor on it.
 */
let editing: number | string | undefined

const Session: PluginComponent = () => {
  const { id } = useDocumentInfo()

  useEffect(() => {
    editing = id ?? undefined
  }, [id])

  return null
}

/**
 * The selection as it stands right now.
 *
 * ToolbarButton calls onSelect from inside `editor.focus()`, so the editor
 * already holds focus when a handler runs and the caret moves the instant
 * anything is awaited. The range and its text are taken here, before the
 * request, and the answer is placed back at that range afterwards. Reading the
 * selection after the await writes into wherever the caret drifted to.
 */
const capture = (editor: LexicalEditor): { selection: BaseSelection | null; text: string } =>
  editor.getEditorState().read(() => {
    const selection = $getSelection()
    return {
      selection: selection?.clone() ?? null,
      text: selection?.getTextContent() ?? '',
    }
  })

/** Runs `place` with the caret back at the captured range. */
const at = (args: {
  editor: LexicalEditor
  place: () => void
  selection: BaseSelection | null
}): void => {
  const { editor, place, selection } = args
  editor.update(() => {
    $setSelection(selection ? selection.clone() : null)
    place()
  })
}

const post = async <T,>(args: { api: string; body: unknown; path: string }): Promise<null | T> => {
  const { api, body, path } = args

  let answer: ({ message?: string } & T) | null = null
  try {
    const res = await fetch(`${api}${path}`, {
      body: JSON.stringify(body),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    answer = (await res.json()) as { message?: string } & T
    if (res.ok) {
      return answer
    }
  } catch {
    answer = null
  }

  // The endpoint has already reduced the failure to one line meant for a person.
  toast.error(answer?.message ?? 'The AI request failed.')
  return null
}

const write = async (args: {
  action: WriteAction
  api: string
  editor: LexicalEditor
  text?: string
}): Promise<void> => {
  const { action, api, editor } = args

  const { selection, text } = capture(editor)
  const source = args.text ?? text
  if (!source) {
    return
  }

  const answer = await post<WriteResponse>({
    api,
    body: { id: editing, action, text: source },
    path: '/ai/write',
  })
  if (!answer?.text) {
    return
  }

  at({
    editor,
    place: () => {
      const live = $getSelection()
      if ($isRangeSelection(live)) {
        live.insertText(answer.text)
      }
    },
    selection,
  })
}

/** The selection is the prompt, and the stored upload document is the result. */
const generate = async (args: { api: string; editor: LexicalEditor }): Promise<void> => {
  const { api, editor } = args

  const { selection, text } = capture(editor)
  if (!text) {
    return
  }

  const image = await post<ImageResponse>({
    api,
    body: { id: editing, prompt: text },
    path: '/ai/image',
  })
  if (!image) {
    return
  }

  at({
    editor,
    place: () => {
      $insertNodes([
        $createUploadNode({
          data: { fields: {}, relationTo: image.collection, value: image.id },
        }),
      ])
    },
    selection,
  })
}

const hasText = ({ selection }: { selection: BaseSelection }): boolean =>
  $isRangeSelection(selection) && !!selection.getTextContent()?.length

const LABELS: Record<WriteAction, string> = {
  draft: 'Draft',
  expand: 'Expand',
  fix: 'Fix grammar',
  rewrite: 'Rewrite',
  shorten: 'Shorten',
  summarize: 'Summarize',
}

const ON_SELECTION: WriteAction[] = ['rewrite', 'expand', 'shorten', 'summarize', 'fix']

const group = (items: ToolbarGroupItem[]): ToolbarGroup => ({
  type: 'dropdown',
  ChildComponent: AIIcon,
  isEnabled: hasText,
  items,
  key: 'ai',
  order: 60,
})

export const HanzoAIFeatureClient = createClientFeature(({ config }) => {
  const api = `${config.serverURL}${config.routes.api}`

  const onSelection: ToolbarGroupItem[] = ON_SELECTION.map((action, index) => ({
    isEnabled: hasText,
    key: `ai-${action}`,
    label: LABELS[action],
    onSelect: ({ editor }) => {
      void write({ action, api, editor })
    },
    order: index + 1,
  }))

  const image: ToolbarGroupItem = {
    isEnabled: ({ editor, selection }) => editor.hasNodes([UploadNode]) && hasText({ selection }),
    key: 'ai-image',
    label: 'Generate image',
    onSelect: ({ editor }) => {
      void generate({ api, editor })
    },
    order: ON_SELECTION.length + 1,
  }

  return {
    plugins: [{ Component: Session, position: 'normal' }],
    slashMenu: {
      // Recomputed on every keystroke after the slash, so the item reads back
      // what has been typed so far and drafts from exactly that.
      dynamicGroups: ({ queryString }): SlashMenuGroup[] =>
        queryString
          ? [
              {
                items: [
                  {
                    Icon: AIIcon,
                    key: 'ai-ask',
                    keywords: ['ai', 'ask', 'draft', 'write'],
                    label: `Ask AI: ${queryString}`,
                    onSelect: ({ editor, queryString: query }) => {
                      void write({ action: 'draft', api, editor, text: query })
                    },
                  },
                ],
                key: 'ai',
                label: 'AI',
              },
            ]
          : [],
    },
    toolbarFixed: { groups: [group([...onSelection, image])] },
    toolbarInline: { groups: [group(onSelection)] },
  }
})
