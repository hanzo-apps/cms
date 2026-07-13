'use client'
import type { LexicalCommand } from 'lexical'

import { createCommand } from 'lexical'

import type { InsertBlockCMS } from './index.js'

export const INSERT_BLOCK_COMMAND: LexicalCommand<InsertBlockCMS> =
  createCommand('INSERT_BLOCK_COMMAND')

export const INSERT_INLINE_BLOCK_COMMAND: LexicalCommand<Partial<InsertBlockCMS>> =
  createCommand('INSERT_INLINE_BLOCK_COMMAND')
