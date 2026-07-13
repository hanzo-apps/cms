'use client'
import type { LexicalCommand } from 'lexical'

import { createCommand } from 'lexical'

import type { LinkCMS } from '../types.js'

export const TOGGLE_LINK_WITH_MODAL_COMMAND: LexicalCommand<LinkCMS | null> = createCommand(
  'TOGGLE_LINK_WITH_MODAL_COMMAND',
)
