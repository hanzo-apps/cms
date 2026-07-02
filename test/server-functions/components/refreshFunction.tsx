'use server'

import { refresh } from '@hanzo/cms-next/auth'

import config from '../config.js'

export async function refreshFunction() {
  try {
    return await refresh({
      config,
    })
  } catch (error) {
    throw new Error(`Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
